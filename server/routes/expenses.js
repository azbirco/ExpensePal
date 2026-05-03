const express = require('express');
const router = express.Router();
const Expense = require('../models/Expenses'); // Siguraduhing capital 'E' at may 's'
const Category = require('../models/Category'); 
const User = require('../models/User'); 
const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL ACTIVE EXPENSES
// Ginagamit sa Dashboard.jsx para ipakita ang listahan ng gastusin
router.get('/', protect, async (req, res) => {
    try {
        const expenses = await Expense.find({ user_id: req.user.id, is_archived: false })
            .populate('category_id', 'category_name category_color') 
            .sort({ date_added: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching expenses", error: err.message });
    }
});

// 2. GET ARCHIVED COUNT (IMPORTANTE: Para sa Sidebar.jsx badge)
// Ito ang nawawalang route kaya nag-e-error ang console mo kanina
router.get('/archived-count', protect, async (req, res) => {
    try {
        const count = await Expense.countDocuments({ 
            user_id: req.user.id, 
            is_archived: true 
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Error counting archives", error: err.message });
    }
});

// 3. ADD NEW EXPENSE (With Labor Hours Logic)
router.post('/add', protect, async (req, res) => {
    const { category_id, item_name, amount } = req.body;

    try {
        const user = await User.findById(req.user.id);
        
        // Labor Logic: Compute hourly rate based on user's monthly salary
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
        res.status(201).json({ message: "Expense added successfully!", expense: newExpense });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 4. ARCHIVE (Soft Delete)
router.put('/archive/:id', protect, async (req, res) => {
    try {
        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { is_archived: true },
            { new: true }
        );
        res.json({ message: "Item moved to Archive", expense: updatedExpense });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 5. PERMANENT DELETE
router.delete('/delete/:id', protect, async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        res.json({ message: "Record permanently deleted" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;