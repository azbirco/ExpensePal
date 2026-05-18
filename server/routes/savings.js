const express = require('express');
const router = express.Router();
const Savings = require('../models/Savings'); 
// FIX: Tamang pag-import gamit ang destructuring
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/savings
router.get('/', protect, async (req, res) => {
    try {
        const savings = await Savings.find({ 
            user_id: req.user.id, 
            isArchived: { $ne: true } 
        }).sort({ date_added: -1 });
        res.json(savings);
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// @route   POST /api/savings
router.post('/', protect, async (req, res) => {
    try {
        const { amount, description, target_amount, expense_ref_id } = req.body;
        const newSaving = new Savings({
            user_id: req.user.id, 
            amount: parseFloat(amount),
            description,
            target_amount: target_amount || 0,
            expense_ref_id,
            isArchived: false,
            date_added: new Date()
        });
        const saving = await newSaving.save();
        res.json(saving);
    } catch (err) {
        res.status(500).json({ message: "Error saving deposit", error: err.message });
    }
});

// @route   PUT /api/savings/archive/:id
router.put('/archive/:id', protect, async (req, res) => {
    try {
        const updated = await Savings.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id }, 
            { isArchived: true }, 
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Record moved to Archive", data: updated });
    } catch (err) {
        res.status(500).json({ message: "Error archiving record", error: err.message });
    }
});

// @route   GET /api/savings/archived-list
router.get('/archived-list', protect, async (req, res) => {
    try {
        const archivedSavings = await Savings.find({ 
            user_id: req.user.id, 
            isArchived: true 
        }).sort({ date_added: -1 });
        res.json(archivedSavings);
    } catch (err) {
        res.status(500).json({ message: "Error fetching archived items", error: err.message });
    }
});

// @route   PUT /api/savings/restore/:id
router.put('/restore/:id', protect, async (req, res) => {
    try {
        const updated = await Savings.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id }, 
            { isArchived: false }, 
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Record restored successfully", data: updated });
    } catch (err) {
        res.status(500).json({ message: "Error restoring record", error: err.message });
    }
});

// @route   DELETE /api/savings/delete/:id
router.delete('/delete/:id', protect, async (req, res) => {
    try {
        const deleted = await Savings.findOneAndDelete({ 
            _id: req.params.id, 
            user_id: req.user.id 
        });
        if (!deleted) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Record permanently deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting record", error: err.message });
    }
});

module.exports = router;