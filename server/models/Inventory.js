import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    type: { type: String, required: true },
    barcode: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 0, default: 0 },
    supplier: { type: String, required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true } // Strict shop relation
}, { timestamps: true });

// Ensure barcodes are unique per individual shop
inventorySchema.index({ barcode: 1, shop: 1 }, { unique: true });

export default mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);