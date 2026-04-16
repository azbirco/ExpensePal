const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // Kunin ang token mula sa Authorization header (Bearer <token>)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        // I-verify ang token gamit ang secret key mo sa .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // I-save ang user info sa request object para magamit sa routes
        req.user = decoded; 
        next(); // Patuloy sa susunod na function
    } catch (err) {
        res.status(401).json({ message: "Invalid or Expired Token" });
    }
};

module.exports = { protect };