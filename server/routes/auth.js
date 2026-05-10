const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Dahil module.exports = protect na ang gamit natin sa middleware,
// diretso na ang pag-import dito bilang isang function.
const auth = require('../middleware/authMiddleware');

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    const { username, email, password, monthly_salary, work_hours } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or Email already exists." });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            user_password: hashedPassword,
            monthly_salary: monthly_salary || 0,
            work_hours_per_month: work_hours || 160
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password." });

        const isMatch = await bcrypt.compare(password, user.user_password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '24h' } 
        );

        res.json({ 
            token, 
            user: { id: user._id, username: user.username, salary: user.monthly_salary } 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// --- GET CURRENT USER DATA ---
// Gagamit na ng 'auth' middleware na na-fix na natin ang export
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-user_password');
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user data", error: err.message });
    }
});

// --- FORGOT PASSWORD STEP 1: VERIFY EMAIL ---
router.post('/verify-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found." });
        res.json({ exists: true, username: user.username, message: "User found." });
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
});

// --- FORGOT PASSWORD STEP 2: RESET PASSWORD ---
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { user_password: hashedPassword },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "User not found." });
        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error resetting password", error: err.message });
    }
});

module.exports = router;