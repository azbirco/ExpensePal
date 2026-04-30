const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense'); // Import ang Model
const Category = require('../models/Category'); // Para sa calculation
const User = require('../models/User'); // Para sa labor hours
const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL ACTIVE EXPENSES (With "JOIN" equivalent)
router.get('/', protect, async (req, res) => {
    try {
        // Gagamit tayo ng .populate() para makuha ang details ng category_id
        const expenses = await Expense.find({ user_id: req.user.id, is_archived: false })
            .populate('category_id', 'category_name category_color') 
            .sort({ date_added: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching expenses", error: err.message });
    }
});

// 2. ADD NEW EXPENSE (With Labor Logic)
router.post('/add', protect, async (req, res) => {
    const { category_id, item_name, amount } = req.body;

    try {
        // Kunin ang user details para sa labor hours computation (Mongoose style)
        const user = await User.findById(req.user.id);
        
        const safeHours = user.work_hours_per_month || 160; 
        const hourly_rate = user.monthly_salary / safeHours;
        const labor_hours = parseFloat(amount) / hourly_rate;

        const newExpense = new Expense({
            user_id: req.user.id,
            category_id: category_id,
            item_name: item_name,
            amount: amount,
            labor_hours_equivalent: labor_hours,
            hourly_rate_at_recording: hourly_rate
        });

        await newExpense.save();
        res.status(201).json({ message: "Expense added successfully!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 3. ARCHIVE (Soft Delete)
router.put('/archive/:id', protect, async (req, res) => {
    try {
        await Expense.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { is_archived: true }
        );
        res.json({ message: "Item moved to Archive" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 4. PERMANENT DELETE
router.delete('/delete/:id', protect, async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        res.json({ message: "Record permanently deleted" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;