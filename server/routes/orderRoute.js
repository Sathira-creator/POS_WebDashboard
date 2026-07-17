import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import authUser from '../middleware/authUser.js';

const orderRouter = express.Router();

orderRouter.post('/create',authUser, createOrder);

export default orderRouter;