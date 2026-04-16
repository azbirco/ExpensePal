const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');
const db = require('../db'); 

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    const { username, email, password, monthly_salary, work_hours } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (username, email, user_password, monthly_salary, work_hours_per_month) 
            VALUES (?, ?, ?, ?, ?)`;
        
        await db.execute(query, [
            username, 
            email, 
            hashedPassword, 
            monthly_salary || 0, 
            work_hours || 160
        ]);

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Username or Email already exists." });
        }
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.user_password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user.user_id, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } 
        );

        res.json({ 
            token, 
            user: { 
                id: user.user_id, 
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
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: "Email not found." });
        }

        // Kung gusto mong magpakita ng personalized hint (hal. "Hello, [Username]")
        res.json({ 
            exists: true, 
            username: users[0].username, 
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
        // I-hash ang bagong password bago i-save (Security Priority)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update query gamit ang 'user_password' column
        const [result] = await db.execute(
            'UPDATE users SET user_password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "Password updated successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error resetting password", error: err.message });
    }
});

module.exports = router;