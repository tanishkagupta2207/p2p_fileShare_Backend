const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { PassThrough } = require('stream');
const File = require('../models/File');
const authMiddleware = require('../middleware/auth'); // Authentication middleware

const router = express.Router();

// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

// OAuth 2.0 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET, 
  process.env.GOOGLE_REDIRECT_URI 
);

// Token setup
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Google Drive API client
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// **Upload File**
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { description } = req.body;

    // Convert file buffer to stream
    const bufferStream = new PassThrough();
    bufferStream.end(req.file.buffer);

    const fileMetadata = { name: req.file.originalname }; // Original file name
    const media = { mimeType: req.file.mimetype, body: bufferStream }; // File stream

    // Upload file to Google Drive
    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink', // File ID and view link
    });

    // Save file metadata to MongoDB
    const file = new File({
      originalFilename: req.file.originalname,
      filename: driveResponse.data.id,
      filepath: driveResponse.data.webViewLink, // Google Drive link
      description,
      uploadedBy: req.user.id, // Assuming `req.user` contains authenticated user info
    });

    await file.save();

    res.json({ success: true, file });
  } catch (err) {
    console.error('Error uploading file:', err.message);
    res.status(500).json({ success: false, message: 'Server error during file upload' });
  }
});

// **Get All Files**
router.get('/', authMiddleware, async (req, res) => {
  try {
    const files = await File.find().populate('uploadedBy', 'username');

    if (files.length === 0) {
      return res.status(404).json({ success: false, message: 'No files found' });
    }

    res.json(files); // Return all file metadata
  } catch (err) {
    console.error('Error fetching files:', err.message);
    res.status(500).json({ success: false, message: 'Server error while fetching files' });
  }
});

// **Search Files**
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query parameter is required' });
    }

    const files = await File.find({
      $or: [
        { originalFilename: { $regex: query, $options: 'i' } }, // Match by original name
        { description: { $regex: query, $options: 'i' } }, // Match by description
      ],
    }).populate('uploadedBy', 'username');

    if (files.length === 0) {
      return res.status(404).json({ success: false, message: 'No files found matching the query' });
    }

    res.json(files);
  } catch (err) {
    console.error('Error searching files:', err.message);
    res.status(500).json({ success: false, message: 'Server error during file search' });
  }
});

// **Download File**
router.get('/download/:id', authMiddleware, async (req, res) => {
  const fileId = req.params.id;

  try {
    // Fetch file metadata from MongoDB
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found in the database' });
    }

    // Retrieve file metadata from Google Drive
    const metadata = await drive.files.get({
      fileId: file.filename, // Google Drive file ID stored in the database
      fields: 'name, mimeType',
    });

    const mimeType = metadata.data.mimeType;
    const fileName = metadata.data.name;

    // Get the file stream from Google Drive
    const fileStream = await drive.files.get(
      {
        fileId: file.filename, // Google Drive file ID
        alt: 'media',
      },
      { responseType: 'stream' }
    );

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalFilename || fileName}"`);
    res.setHeader('Content-Type', mimeType);

    // Pipe the file stream to the response
    fileStream.data
      .on('end', () => {console.log("file downloaded!");})
      .on('error', (err) => {
        console.error('Error streaming file:', err);
        res.status(500).json({ success: false, message: 'Error streaming file from Google Drive' });
      })
      .pipe(res);
  } catch (err) {
    console.error('Error downloading file:', err.message);
    res.status(500).json({ success: false, message: 'Server error during file download' });
  }
});

module.exports = router;
