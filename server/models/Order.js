import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  netTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'online', 'card'], required: true },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' },
  cashReceived: { type: Number, default: 0 },
  changeGiven: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);