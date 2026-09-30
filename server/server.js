import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dns from 'node:dns';
import cookieParser from 'cookie-parser';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoute.js';
import inventoryRouter from './routes/inventoryRoute.js';
import posRouter from './routes/posRoute.js';
import orderRouter from './routes/orderRoute.js';
import chartRouter from './routes/chartRoute.js';
import shopRoutes from './routes/shopRoutes.js';

// Local-only workaround for Atlas SRV lookups; not needed on Vercel
if (!process.env.VERCEL) {
  dns.setServers(['1.1.1.1', '1.0.0.1']);
}

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// Needed so secure cookies work behind Vercel's proxy
app.set('trust proxy', 1);

// Connect to MongoDB (fail loudly in the logs if it can't connect)
try {
  await connectDB();
} catch (err) {
  console.error('MongoDB connection failed:', err);
  throw err;
}

// Allowed origins: set CLIENT_URL in Vercel env vars (your deployed frontend URL)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'exp://10.183.170.180:8081',
  'http://localhost:8081',
].filter(Boolean);

// Socket.io with CORS matching Express
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  // Polling needs sticky instances, which serverless doesn't guarantee.
  // The client must also use { transports: ['websocket'] }.
  transports: ['websocket'],
});

// Make io accessible inside routes via req.app.get('io')
app.set('io', io);

// Socket.io connection & room handling
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

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// API routes
app.get('/', (req, res) => res.send('API is working'));
app.use('/api/user', userRouter);
app.use('/api/shop', shopRoutes);
app.use('/api/inventory', inventoryRouter);
app.use('/api/pos', posRouter);
app.use('/api/order', orderRouter);
app.use('/api/reports', chartRouter);

// Only listen when running locally; Vercel supplies its own listener
if (!process.env.VERCEL) {
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Vercel uses this export as the entry point
export default server;