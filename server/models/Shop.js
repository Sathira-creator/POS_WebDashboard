import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String },
  district: { type: String },
  city: { type: String },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }] // Many-to-many
}, { timestamps: true });

export default mongoose.models.Shop || mongoose.model('Shop', shopSchema);