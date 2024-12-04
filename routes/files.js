// const express = require('express');
// const multer = require('multer');
// // const File = require('../models/File');
// const auth = require('../middleware/auth');
// const path = require('path');
// const fs = require('fs');

// const router = express.Router();

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// // Upload a file
// router.post('/upload', auth, upload.single('file'), async (req, res) => {
//   try {
//     const { description } = req.body;
//     const file = new File({
//       originalFilename: req.file.originalname,
//       filename: req.file.filename,
//       filepath: req.file.path,
//       description,
//       uploadedBy: req.user.id,
//     });

//     await file.save();
//     console.log('File uploaded successfully:', file);
//     res.json(file);
//   } catch (err) {
//     console.error('Error uploading file:', err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Get all files
// router.get('/', async (req, res) => {
//   try {
//     const files = await File.find().populate('uploadedBy', 'username');
//     res.json(files);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Search for files
// router.get('/search', async (req, res) => {
//   try {
//     const { query } = req.query;
//     const files = await File.find({
//       $or: [
//         { filename: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } },
//       ],
//     }).populate('uploadedBy', 'username');
//     res.json(files);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // Download a file
// router.get('/download/:id', async (req, res) => {
//   const fileId = req.params.id;

//   try {
//     console.log(`Attempting to download file with ID: ${fileId}`);
//     const file = await File.findById(fileId);
//     if (!file) {
//       console.error('File not found');
//       return res.status(404).json({ success: false, msg: 'File not found' });
//     }

//     const filePath = path.join(__dirname, '..', '..', file.filepath);
//     console.log(`File path: ${filePath}`);

//     // Check if file exists
//     if (!fs.existsSync(filePath)) {
//       console.error('File does not exist on disk');
//       return res.status(404).json({ success: false, msg: 'File not found on disk' });
//     }

//     res.setHeader('Content-Disposition', `attachment; filename="${file.originalFilename}"`);
//     res.sendFile(filePath, (err) => {
//       if (err) {
//         console.error('Error sending file:', err);
//         res.status(500).send('Server error');
//       } else {
//         console.log('File sent successfully');
//       }
//     });
//   } catch (error) {
//     console.error('Error in downloadFile:', error);
//     return res.status(500).json({ success: false, error: 'Server error during download' });
//   }
// });

// module.exports = router;
