import User from "../models/User.js";
import Shop from "../models/Shop.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';

// Shared cookie settings (import this in shopController.js too)
export const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Only the mobile app gets the token in the JSON body
const isMobileClient = (req) => req.headers['x-client'] === 'mobile';

// Register User : /api/user/register
export const register = async (req, res) => {
    try {
        const { name, position, email, password } = req.body;

        if (!name || !position || !email || !password) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "user already exist" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, position, email, password: hashedPassword });

        const token = signToken(user._id);
        res.cookie('token', token, cookieOptions);

        return res.json({
            success: true,
            ...(isMobileClient(req) && { token }),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                position: user.position,
                shops: []
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Login user : /api/user/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.json({ success: false, message: 'email and password are required' });

        const user = await User.findOne({ email }).populate('shops');

        if (!user) {
            return res.json({ success: false, message: 'invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'invalid username or password' });
        }

        const token = signToken(user._id);
        res.cookie('token', token, cookieOptions);

        return res.json({
            success: true,
            ...(isMobileClient(req) && { token }),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                position: user.position,
                shops: user.shops
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Check auth : /api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User context not found." });
        }

        const user = await User.findById(userId).select("-password").populate('shops');

        if (!user) {
            return res.status(404).json({ success: false, message: "User profile not found." });
        }

        return res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                position: user.position,
                shops: user.shops
            }
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Logout user : /api/user/logout
export const logout = async (req, res) => {
    try {
        // Options must match the ones used to set the cookie (maxAge is not needed)
        const { maxAge, ...clearOptions } = cookieOptions;
        res.clearCookie('token', clearOptions);
        return res.json({ success: true, message: "logged out" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// add user : /api/user/add-worker
export const addWorker = async (req, res) => {
    try {
        const { name, email, password, position } = req.body;
        const shopId = req.shopId; // from verifyShopAccess

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Name, email, and password are required." });
        }

        let user = await User.findOne({ email });

        if (user) {
            user.shops = user.shops || [];
            const alreadyInShop = user.shops.some(s => s && s.toString() === shopId.toString());

            if (alreadyInShop) {
                return res.json({ success: false, message: "Worker is already added to this shop." });
            }

            user.shops.push(shopId);
            await user.save();
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                position: position || 'Cashier',
                shops: [shopId]
            });
        }

        await Shop.findByIdAndUpdate(shopId, { $addToSet: { users: user._id } });

        return res.json({ success: true, message: "Worker successfully added to the shop!" });
    } catch (error) {
        console.log("Add Worker Error:", error.message);
        return res.json({ success: false, message: error.message });
    }
};