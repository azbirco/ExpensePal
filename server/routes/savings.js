const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

// 1. Get Total Savings & History
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM savings WHERE user_id = ? ORDER BY date_added DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching savings", error: err.message });
    }
});

// 2. Add Savings Entry
router.post('/add', protect, async (req, res) => {
    const { amount, description } = req.body;
    try {
        await db.execute(
            'INSERT INTO savings (user_id, amount, description) VALUES (?, ?, ?)',
            [req.user.id, amount, description]
        );
        res.status(201).json({ message: "Savings updated!" });
    } catch (err) {
        res.status(500).json({ message: "Error adding savings" });
    }
});

module.exports = router;