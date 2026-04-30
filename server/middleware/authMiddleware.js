const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Sa MongoDB, ang decoded.id ay maglalaman ng user._id 
        // na ni-sign natin sa auth.js kanina.
        req.user = decoded; 
        next(); 
    } catch (err) {
        // Mas maganda kung i-log natin ang error para sa debugging
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ message: "Invalid or Expired Token" });
    }
};

module.exports = { protect };