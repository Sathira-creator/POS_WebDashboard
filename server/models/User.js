import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    sales: { type: Number, default: 0 },
    shops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }] // Many-to-many
}, {
    minimize: false,
    timestamps: true
});

export default mongoose.models.user || mongoose.model('user', userSchema);