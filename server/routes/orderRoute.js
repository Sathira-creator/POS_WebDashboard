import express from 'express';
import { createOrder, getShopOrders } from '../controllers/orderController.js';
import authUser from '../middleware/authUser.js';
import Order from '../models/Order.js';
import { verifyShopAccess } from '../middleware/authShop.js';

const orderRouter = express.Router();

orderRouter.get('/orderlist', authUser, verifyShopAccess, getShopOrders);
orderRouter.post('/create',authUser, verifyShopAccess,  createOrder);

orderRouter.get('/public/:id', async (req, res) => {
    try {
        // Look up the order and populate the 'shop' reference to get name and address
        const order = await Order.findById(req.params.id).populate('shop', 'name address district city');
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Receipt not found.' });
        }
        
        // Return the order document (which now includes populated shop details)
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Public receipt fetch error:", error.message);
        return res.status(500).json({ success: false, message: "Error fetching receipt details.", error: error.message });
    }
    });

export default orderRouter;