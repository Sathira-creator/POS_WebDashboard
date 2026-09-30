import express from 'express';
import { getCartByBarcode } from '../controllers/posController.js';
import { verifyShopAccess } from '../middleware/authShop.js';
import authUser from '../middleware/authUser.js';
import { getCart } from '../controllers/posController.js';
import { getProductByBarcode } from '../controllers/posController.js';
import { removeFromCart } from '../controllers/posController.js';

const posRouter = express.Router();

// Added authUser so the controller knows which employee's cart to update/broadcast
posRouter.get('/list', authUser, verifyShopAccess, getCartByBarcode);
posRouter.get('/current', authUser, verifyShopAccess, getCart);
posRouter.get('/lookup', authUser, getProductByBarcode);
posRouter.delete('/remove', authUser, removeFromCart);

export default posRouter;