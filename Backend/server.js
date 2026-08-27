const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // For development
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Expose io to routes/controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workerRoutes = require('./routes/workerRoutes');
const cooperativeRoutes = require('./routes/cooperativeRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send('CoopSeva API is running...');
});

// Socket.io logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('joinLocationRoom', (locationRoom) => {
        socket.join(locationRoom);
        console.log(`Socket ${socket.id} joined room ${locationRoom}`);
    });
    
    socket.on('leaveLocationRoom', (locationRoom) => {
        socket.leave(locationRoom);
        console.log(`Socket ${socket.id} left room ${locationRoom}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT} with Socket.IO`));
