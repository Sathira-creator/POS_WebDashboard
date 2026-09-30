import Shop from '../models/Shop.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerShopAndOwner = async (req, res) => {
  try {
    const { name, position, email, password, shopName, address, district, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create Shop
    const newShop = await Shop.create({
      name: shopName,
      address,
      district,
      city
    });

    // 2. Create Owner User
    const newOwner = await User.create({
      name,
      position: position || 'Owner',
      email,
      password: hashedPassword,
      shops: [newShop._id]
    });

    // 3. Link Owner back into Shop
    newShop.users.push(newOwner._id);
    await newShop.save();

    const token = jwt.sign({ id: newOwner._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const isMobile = req.headers['x-client'] === 'mobile';

    return res.json({
      success: true,
      ...(isMobile && { token }),   // token in the body only for the mobile app
      user: {
        id: newOwner._id,
        name: newOwner.name,
        email: newOwner.email,
        position: newOwner.position,
        shops: [newShop]
      }
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// Get shop details and populated workers list
export const getShopDetails = async (req, res) => {
    try {
        const shopId = req.shopId; // Provided by your verifyShopAccess middleware
        const shop = await Shop.findById(shopId).populate('users', '-password');

        if (!shop) {
            return res.json({ success: false, message: "Shop not found" });
        }

        return res.json({ success: true, shop });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};