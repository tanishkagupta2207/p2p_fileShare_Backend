const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'https://p2p-file-share-frontend.vercel.app',  // Only allow your frontend to access the backend
  methods: ['GET', 'POST'],  // Allow GET and POST requests
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],  // Allow these headers in requests
};

app.use(cors(corsOptions));

// Ensure that OPTIONS requests are handled (preflight requests)
app.options('*', cors(corsOptions));  // Pre-flight support
app.use(express.json());

// Connect to MongoDB Atlas
const dbURI = process.env.REACT_APP_DB_URL;
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

app.get('/', (req, res) => {
  res.send('P2P LAN File Sharing System');
});

// Export app for Vercel
module.exports = app;