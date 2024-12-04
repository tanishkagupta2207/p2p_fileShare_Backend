const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
// const fileRoutes = require('./routes/files');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
// const dbURI = 'mongodb+srv://Tanishka:Tanishka2207@cluster0.mongodb.net/ShareSync?retryWrites=true&w=majority&appName=Cluster0';
const dbURI = 'mongodb+srv://Tanishka:Tanishka2207@sharesync.j77hj.mongodb.net/?retryWrites=true&w=majority&appName=ShareSync';
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/files', fileRoutes);

app.get('/', (req, res) => {
  res.send('P2P LAN File Sharing System');
});

// Socket.io connection
const peers = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('register-peer', ({ peerId }) => {
    peers[peerId] = socket.id;
    console.log(`Peer registered: ${peerId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const peerId in peers) {
      if (peers[peerId] === socket.id) {
        delete peers[peerId];
        console.log(`Peer unregistered: ${peerId}`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));