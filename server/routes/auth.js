const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
// In-import natin ang parehong protect at admin middleware
const { protect: auth, admin } = require('../middleware/authMiddleware');

// ==========================================
// --- PUBLIC ROUTES (No Auth Required) ---
// ==========================================

// REGISTER ROUTE
router.post('/register', async (req, res) => {
    const { username, email, password, monthly_salary, work_hours } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or Email already exists." });
        }

        if (monthly_salary < 0 || work_hours < 0) {
            return res.status(400).json({ message: "Salary and Work Hours must be positive numbers." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            user_password: hashedPassword,
            monthly_salary: monthly_salary || 0,
            work_hours_per_month: work_hours > 0 ? work_hours : 160,
            status: 'pending', // Default is pending for Admin approval
            role: 'user'
        });

        await newUser.save();
        res.status(201).json({ message: "Registration successful! Please wait for Admin approval." });
    } catch (err) {
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password." });

        // Handshake check for Admin Approval status
        if (user.status === 'pending') {
            return res.status(403).json({ message: "Your account is pending approval. Please contact the Admin." });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ message: "Your account request has been rejected." });
        }

        const isMatch = await bcrypt.compare(password, user.user_password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: '24h' } 
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                salary: user.monthly_salary,
                role: user.role 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// FORGOT PASSWORD STEP 1: VERIFY EMAIL
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

// FORGOT PASSWORD STEP 2: RESET PASSWORD
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

// ==========================================
// --- PRIVATE ROUTES (Auth Required) ---
// ==========================================

// GET PROFILE DATA
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-user_password');
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile data", error: err.message });
    }
});

// UPDATE PROFILE DATA
router.put('/profile', auth, async (req, res) => {
    const { 
        username, 
        monthly_salary, 
        work_hours_per_month, 
        occupation, 
        institution, 
        location, 
        bio,
        profile_photo 
    } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { 
                $set: { 
                    username, 
                    monthly_salary, 
                    work_hours_per_month, 
                    occupation, 
                    institution, 
                    location, 
                    bio,
                    profile_photo
                } 
            },
            { new: true, runValidators: true }
        ).select('-user_password');

        if (!updatedUser) return res.status(404).json({ message: "User not found." });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Error updating profile", error: err.message });
    }
});

// ==========================================
// --- ADMIN ROUTES (Admin Only Required) ---
// ==========================================

// ADMIN: GET ALL USERS (Para sa User Management table)
router.get('/users', auth, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-user_password').sort({ created_at: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
});

// ADMIN: UPDATE USER STATUS (Approve/Reject)
router.put('/users/:id/status', auth, admin, async (req, res) => {
    const { status } = req.body; // Inaasahan: 'approved' o 'rejected'
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-user_password');

        if (!updatedUser) return res.status(404).json({ message: "User not found." });
        res.json({ message: `User status updated to ${status}`, user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Error updating status", error: err.message });
    }
});

// ADMIN: DELETE USER ACCOUNT
router.delete('/users/:id', auth, admin, async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ message: "User not found." });

        // Preventive check: Bawal i-delete ng admin ang sarili niyang account
        if (userToDelete._id.toString() === req.user.id) {
            return res.status(400).json({ message: "You cannot delete your own admin account." });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User account deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
});

module.exports = router;