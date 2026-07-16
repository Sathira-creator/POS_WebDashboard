import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true },
    position: {type: String, required: true },
    email: {type: String, required: true, unique: true },
    password: {type: String, required: true },
    sales: {type: Number, default: 0},
}, 
{minimize: false},
{timestamps: true})

const User =  mongoose.models.user || mongoose.model('user', userSchema)

export default User 