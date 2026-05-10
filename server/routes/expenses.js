const express = require('express');
const router = express.Router();
const Expenses = require('../models/Expenses'); 
const Savings = require('../models/Savings');
const Category = require('../models/Category'); 
const User = require('../models/User'); 
const auth = require('../middleware/authMiddleware'); // FIX: Direct import

// --- NEW: SIDEBAR COUNTS ENDPOINT ---
router.get('/sidebar-counts', auth, async (req, res) => {
    try {
        const [active, archived, savings] = await Promise.all([
            Expenses.countDocuments({ user_id: req.user.id, is_archived: false }),
            Expenses.countDocuments({ user_id: req.user.id, is_archived: true }),
            Savings.countDocuments({ user_id: req.user.id })
        ]);
        res.json({ active, archived, savings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 1. GET ALL ACTIVE EXPENSES ---
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expenses.find({ 
            user_id: req.user.id, 
            is_archived: false 
        }).populate('category_id').sort({ date_added: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 2. GET ALL ARCHIVED ITEMS ---
router.get('/archived', auth, async (req, res) => {
    try {
        const archivedExpenses = await Expenses.find({ 
            user_id: req.user.id, 
            is_archived: true 
        }).populate('category_id').sort({ date_added: -1 });
        res.json(archivedExpenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- 3. CREATE NEW EXPENSE ---
router.post('/', auth, async (req, res) => {
    try {
        const { item_name, amount, category_id } = req.body;
        const user = await User.findById(req.user.id);
        const monthlySalary = user.monthly_salary || 0;
        const monthlyHours = user.work_hours_per_month || 160;
        let laborHours = 0;

        if (monthlySalary > 0) {
            const hourlyRate = monthlySalary / monthlyHours;
            laborHours = amount / hourlyRate;
        }

        const newExpense = new Expenses({
            user_id: req.user.id,
            item_name,
            amount,
            category_id,
            labor_hours_equivalent: laborHours,
            date_added: new Date()
        });

        const savedExpense = await newExpense.save();
        const category = await Category.findById(category_id);
        if (category && (category.category_name.toLowerCase().includes('sav') || category.category_name.toLowerCase().includes('emer'))) {
            await Savings.create({
                user_id: req.user.id,
                amount: savedExpense.amount,
                description: savedExpense.item_name,
                expense_ref_id: savedExpense._id
            });
        }
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- 4. UPDATE EXPENSE ---
router.put('/:id', auth, async (req, res) => {
    try {
        const { item_name, amount, category_id } = req.body;
        const user = await User.findById(req.user.id);
        const monthlySalary = user.monthly_salary || 0;
        const monthlyHours = user.work_hours_per_month || 160;
        let laborHours = 0;

        if (monthlySalary > 0) {
            const hourlyRate = monthlySalary / monthlyHours;
            laborHours = amount / hourlyRate;
        }

        const updatedExpense = await Expenses.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { item_name, amount, category_id, labor_hours_equivalent: laborHours },
            { new: true }
        );

        const category = await Category.findById(category_id);
        if (category && (category.category_name.toLowerCase().includes('sav') || category.category_name.toLowerCase().includes('emer'))) {
            await Savings.findOneAndUpdate(
                { expense_ref_id: updatedExpense._id },
                { 
                    user_id: req.user.id, 
                    amount: updatedExpense.amount, 
                    description: updatedExpense.item_name, 
                    expense_ref_id: updatedExpense._id 
                },
                { upsert: true, new: true }
            );
        } else {
            await Savings.findOneAndDelete({ expense_ref_id: updatedExpense._id });
        }
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: "Update failed" });
    }
});

// --- 5. ARCHIVE AN ITEM ---
router.put('/archive/:id', auth, async (req, res) => {
    try {
        await Expenses.findOneAndUpdate({ _id: req.params.id, user_id: req.user.id }, { is_archived: true });
        res.json({ message: "Archived" });
    } catch (err) {
        res.status(500).json({ message: "Failed to archive" });
    }
});

// --- 6. RESTORE AN ITEM ---
router.put('/restore/:id', auth, async (req, res) => {
    try {
        await Expenses.findOneAndUpdate({ _id: req.params.id, user_id: req.user.id }, { is_archived: false });
        res.json({ message: "Restored" });
    } catch (err) {
        res.status(500).json({ message: "Failed to restore" });
    }
});

// --- 7. PERMANENT DELETE ---
router.delete('/delete/:id', auth, async (req, res) => {
    try {
        await Expenses.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        await Savings.findOneAndDelete({ expense_ref_id: req.params.id });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;