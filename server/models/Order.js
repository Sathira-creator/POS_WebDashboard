import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  netTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'online', 'card'], required: true },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' },
  cashReceived: { type: Number, default: 0 },
  changeGiven: { type: Number, default: 0 }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;