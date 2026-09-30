import express from 'express';
import { getShopDetails, registerShopAndOwner } from '../controllers/shopController.js';
import { verifyShopAccess } from '../middleware/authShop.js';

const router = express.Router();

router.post('/register', registerShopAndOwner);
router.get('/details',verifyShopAccess, getShopDetails);

export default router;