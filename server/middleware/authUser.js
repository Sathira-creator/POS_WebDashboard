import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    let token;

    // 1. Check cookies (for Web)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // 2. Check Authorization header (for Mobile App)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'not authorized' });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if (tokenDecode.id) {
            req.body = req.body || {};
            req.userId = tokenDecode.id;
        } else {
            return res.status(401).json({ success: false, message: 'not authorized' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};

export default authUser;