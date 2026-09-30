import express from 'express';
import { addWorker, isAuth, login, logout, register } from '../controllers/userController.js';
import authUser from '../middleware/authUser.js';
import { verifyShopAccess } from '../middleware/authShop.js';


const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/add-worker', verifyShopAccess, addWorker);
userRouter.get('/is-auth', authUser, isAuth)
userRouter.get('/logout', authUser, logout)


export default userRouter