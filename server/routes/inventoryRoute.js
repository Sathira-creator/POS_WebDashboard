import express from 'express';
import { addInventory, deleteInventory, getInventory, searchInventory, updateInventory } from '../controllers/inventoryController.js';


const inventoryRouter = express.Router();

inventoryRouter.post('/add', addInventory);
inventoryRouter.get('/list', getInventory);
inventoryRouter.post('/update', updateInventory);
inventoryRouter.delete('/delete', deleteInventory);
inventoryRouter.get('/search', searchInventory);



export default inventoryRouter