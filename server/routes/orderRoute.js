import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import authUser from '../middleware/authUser.js';
import Order from '../models/Order.js';

const orderRouter = express.Router();

orderRouter.post('/create',authUser, createOrder);

orderRouter.get('/public/:id', async (req, res) => {
    try {
        // Look up the order using the database ID passed in the URL parameters
        const order = await Order.findById(req.params.id);
        
        if (!order) {
        return res.status(404).json({ success: false, message: 'Receipt not found.' });
        }
        
        // Return the order document cleanly to the public React screen
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Public receipt fetch error:", error.message);
        return res.status(500).json({ success: false, message: "Error fetching receipt details.", error: error.message });
    }
    });

export default orderRouter;