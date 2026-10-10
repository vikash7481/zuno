import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Real-time WebSocket layer
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join order room for live tracking
  socket.on('join_order_room', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined room order_${orderId}`);
  });

  // Join admin room for real-time dispatch alerts
  socket.on('join_admin_channel', () => {
    socket.join('admin_channel');
    console.log(`[Socket.IO] Socket ${socket.id} joined admin_channel`);
  });

  // Join delivery partner room
  socket.on('join_delivery_channel', (partnerId) => {
    socket.join(`delivery_${partnerId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined delivery_${partnerId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start database and server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`  Zuno Enterprise Platform Server Running`);
      console.log(`  Port: http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=================================================\n`);
    });
  } catch (error) {
    console.error(`Failed to launch server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

startServer();
