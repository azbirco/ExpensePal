const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        //req.user ay maglalaman ng { id: user._id, username: user.username }
        req.user = decoded; 
        next(); 
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ message: "Invalid or Expired Token" });
    }
};

// FIX: I-export ang function mismo, hindi object
module.exports = protect;