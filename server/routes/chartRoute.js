import express from 'express';
import { getDashboardAnalytics, getLineChartData, getPieChartData } from '../controllers/chartController.js';
import authUser from '../middleware/authUser.js';
import { verifyShopAccess } from '../middleware/authShop.js';

const chartRouter = express.Router();

chartRouter.get('/statdata',verifyShopAccess, getDashboardAnalytics);
chartRouter.get('/pie',verifyShopAccess, getPieChartData)

chartRouter.get('/:type', authUser, getLineChartData);

export default chartRouter;