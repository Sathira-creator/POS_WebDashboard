import express from 'express';
import { getLineChartData } from '../controllers/chartController.js';
import authUser from '../middleware/authUser.js';

const chartRouter = express.Router();

chartRouter.get('/:type', authUser, getLineChartData);

export default chartRouter;