const express = require('express');
const connectToMongo = require('./db');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const Chat = require('./models/ChatModel');

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Mongo
connectToMongo();

// Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/fogotpassword', require('./routes/forgotpass'));
app.use('/hosting', require('./routes/hosting'));
app.use('/booking', require('./routes/booking'));
app.use('/places', require('./routes/places'));
app.use('/chats', require('./routes/chats'));

// Server start
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Real-time chat
const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000',
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io:', socket.id);

  socket.on('setup', (userData) => {
    if (!userData?._id) {
      console.error('Invalid userData for setup:', userData);
      return;
    }
    socket.userId = userData._id;
    socket.join(userData._id);
    console.log(`User joined room: ${userData._id} (${userData.email})`);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    if (!room) {
      console.error('Invalid room ID:', room);
      return;
    }
    socket.join(room);
    console.log(`User ${socket.userId} joined chat room: ${room}`);
  });

  socket.on('new message', (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat?.users) {
      console.error('chat.users not defined:', newMessageRecieved);
      return;
    }

    console.log('New message to broadcast:', newMessageRecieved);
    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.to(user._id).emit('message recieved', newMessageRecieved);
      console.log(`Sent message to user: ${user._id}`);
    });
  });

  socket.on('typing', async (chatId) => {
    if (!chatId || !socket.userId) {
      console.error('Missing chatId or userId for typing:', { chatId, userId: socket.userId });
      return;
    }
    console.log(`Typing in chat: ${chatId} by user: ${socket.userId}`);
    try {
      const chat = await Chat.findById(chatId).populate('users', '_id');
      if (!chat) {
        console.error('Chat not found:', chatId);
        return;
      }
      chat.users.forEach((user) => {
        if (user._id.toString() !== socket.userId) {
          socket.to(user._id.toString()).emit('typing', chatId);
          console.log(`Broadcasted typing to user: ${user._id}`);
        }
      });
    } catch (error) {
      console.error('Broadcasting typing error:', error);
    }
  });

  socket.on('stop typing', async (chatId) => {
    if (!chatId || !socket.userId) {
      console.error('Missing chatId or userId for stop typing:', { chatId, userId: socket.userId });
      return;
    }
    console.log(`Stop typing in chat: ${chatId} by user: ${socket.userId}`);
    try {
      const chat = await Chat.findById(chatId).populate('users', '_id');
      if (!chat) {
        console.error('Chat not found:', chatId);
        return;
      }
      chat.users.forEach((user) => {
        if (user._id.toString() !== socket.userId) {
          socket.to(user._id.toString()).emit('stop typing', chatId);
          console.log(`Broadcasted stop typing to user: ${user._id}`);
        }
      });
    } catch (error) {
      console.error('Broadcasting stop typing error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    if (socket.userId) {
      socket.leave(socket.userId);
    }
  });
});
