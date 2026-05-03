const express = require('express');
const router = express.Router();
// SIGURADUHIN: Ang filename sa folder ay Savings.js (may 's')
const Saving = require('../models/Savings'); 
const { protect } = require('../middleware/authMiddleware');

// 1. Get Total Savings & History
router.get('/', protect, async (req, res) => {
    try {
        const savings = await Saving.find({ user_id: req.user.id })
                                    .sort({ date_added: -1 });
        res.json(savings);
    } catch (err) {
        res.status(500).json({ message: "Error fetching savings", error: err.message });
    }
});

// 2. Add Savings Entry
router.post('/add', protect, async (req, res) => {
    const { amount, description } = req.body;
    try {
        const newSaving = new Saving({
            user_id: req.user.id,
            amount: amount,
            description: description
        });

        await newSaving.save();
        res.status(201).json({ message: "Savings updated!" });
    } catch (err) {
        res.status(500).json({ message: "Error adding savings", error: err.message });
    }
});

module.exports = router;