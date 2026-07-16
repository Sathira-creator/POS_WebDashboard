import express, { response } from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import dns from 'node:dns';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoute.js';
import inventoryRouter from './routes/inventoryRoute.js';
import mongoose from 'mongoose';
import Inventory from './models/Inventory.js';
import posRouter from './routes/posRoute.js';

//Force Node.js to use public DNS servers
dns.setServers(['1.1.1.1', '1.0.0.1']); 


 const app = express();
 const port = process.env.PORT || 4000;

 await connectDB()

 //Allow multiple origins 
 const allowedOrigins = ['http://localhost:5173']


 // Middleware configuration
 app.use(express.json());
 app.use(cookieParser());
 app.use(cors({origin: allowedOrigins, credentials: true}));


 app.get('/', (req,res) => res.send("API is working"))
 app.use('/api/user', userRouter)
 app.use('/api/inventory', inventoryRouter)
 app.use('/api/pos', posRouter)
//  app.use('/api/seller', sellerRouter)
//  app.use('/api/product', productRouter)
//  app.use('/api/cart', cartRouter)
//  app.use('/api/address', addressRouter)
//  app.use('/api/order', orderRouter)




 app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`)
 })