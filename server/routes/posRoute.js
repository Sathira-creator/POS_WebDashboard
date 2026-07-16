import express from 'express';
import { getCartByBarcode } from '../controllers/posController.js';

const posRouter = express.Router();

posRouter.get('/list', getCartByBarcode);


export default posRouter;
