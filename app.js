const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

const app = express();

// Middleware
app.use(cors());
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