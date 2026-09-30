import express from 'express';
import { addInventory, deleteInventory, getInventory, searchInventory, updateInventory } from '../controllers/inventoryController.js';
import { verifyShopAccess } from '../middleware/authShop.js';


const inventoryRouter = express.Router();

inventoryRouter.post('/add',verifyShopAccess, addInventory);
inventoryRouter.get('/list', verifyShopAccess, getInventory);
inventoryRouter.post('/update', verifyShopAccess, updateInventory);
inventoryRouter.delete('/delete', verifyShopAccess, deleteInventory);
inventoryRouter.get('/search', verifyShopAccess, searchInventory);



export default inventoryRouter