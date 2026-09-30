import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const verifyShopAccess = async (req, res, next) => {
  try {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      return res.status(400).json({ success: false, message: "No active shop selected." });
    }

    // Cookie first (web), then Bearer header (mobile)
    const token = req.cookies?.token
      || (req.headers.authorization?.startsWith('Bearer ')
          ? req.headers.authorization.split(' ')[1]
          : null);

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    const userHasAccess = (user.shops || []).some(s => s && s.toString() === shopId.toString());
    if (!userHasAccess) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this shop." });
    }

    req.user = user;
    req.userId = user._id;
    req.shopId = shopId;
    next();
  } catch (error) {
    const status = ['JsonWebTokenError', 'TokenExpiredError'].includes(error.name) ? 401 : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};