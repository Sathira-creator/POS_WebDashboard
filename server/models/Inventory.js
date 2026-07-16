import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
    name: {type: String, required: true },
    category: {type: String, required: true },
    type: {type: String, required: true },
    barcode: {type: String, required: true },
    price: {type: Number, required: true },
    qty: {type: Number, required: true },
    supplier: {type: String, required: true },
    
}, { timestamps: true })

const Inventory =  mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema)

export default Inventory ;
