import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 }
});

const cartSchema = new mongoose.Schema({
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    items: [cartItemSchema]
}, { timestamps: true });

// Ensure each cashier has only one active cart session per shop
cartSchema.index({ shop: 1, cashierId: 1 }, { unique: true });

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);