import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './configs/db.js';
import 'dotenv/config';
import dns from 'node:dns';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoute.js';
import inventoryRouter from './routes/inventoryRoute.js';
import posRouter from './routes/posRoute.js';
import orderRouter from './routes/orderRoute.js';
import chartRouter from './routes/chartRoute.js';
import shopRoutes from './routes/shopRoutes.js';

// Force Node.js to use public DNS servers
dns.setServers(['1.1.1.1', '1.0.0.1']); 

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;



await connectDB();

// Allow multiple origins 
const allowedOrigins = [
  'https://pos-web-dashboard-gold.vercel.app', 
  'exp://10.183.170.180:8081', 
  'http://localhost:8081'
];

// Setup Socket.io with CORS matching Express
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Make io accessible inside routes via req.app.get('io')
app.set('io', io);

// Socket.io Connection & Room Handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a specific employee/shop cart room for real-time barcode syncing
  socket.on('join_employee_cart', ({ shopId, employeeId }) => {
    if (shopId && employeeId) {
      const roomName = `cart_${shopId}_${employeeId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API Routes
app.get('/', (req, res) => res.send("API is working"));
app.use('/api/user', userRouter);
app.use('/api/shop', shopRoutes);
app.use('/api/inventory', inventoryRouter);
app.use('/api/pos', posRouter);
app.use('/api/order', orderRouter);
app.use('/api/reports', chartRouter);

// Start server using 'server.listen' instead of 'app.listen' to support WebSockets
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});