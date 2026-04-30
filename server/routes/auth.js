const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // I-import ang Mongoose Model

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    const { username, email, password, monthly_salary, work_hours } = req.body;

    try {
        // Check kung existing na ang user (MongoDB-style)
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or Email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Gagawa ng bagong User document
        const newUser = new User({
            username,
            email,
            user_password: hashedPassword,
            monthly_salary: monthly_salary || 0,
            work_hours_per_month: work_hours || 160
        });

        await newUser.save(); // Save sa MongoDB

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Hanapin ang user gamit ang email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.user_password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, username: user.username }, // MongoDB uses _id
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '24h' } 
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username,
                salary: user.monthly_salary 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// --- FORGOT PASSWORD STEP 1: VERIFY EMAIL ---
router.post('/verify-email', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Email not found." });
        }

        res.json({ 
            exists: true, 
            username: user.username, 
            message: "User found." 
        });
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

        // Update document sa MongoDB
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { user_password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error resetting password", error: err.message });
    }
});

module.exports = router;