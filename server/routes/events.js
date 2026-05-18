const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
// FIX: Dito ang pagkakamali, dapat naka-destructure
const { protect } = require('../middleware/authMiddleware');

// --- 1. CREATE NEW EVENT ---
// FIX: Ginamit na natin ang 'protect' sa halip na 'auth'
router.post('/', protect, async (req, res) => {
    try {
        const { title, type, target_amount, members } = req.body;
        if (members.length > 15) {
            return res.status(400).json({ message: "A group event is limited to 15 members only." });
        }
        const newEvent = new Event({
            user_id: req.user.id, 
            title,
            type,
            target_amount: parseFloat(target_amount),
            members: members.map(m => ({
                name: m.name,
                avatar: m.avatar,
                amount_paid: 0,
                is_paid: false,
                payments: [] 
            }))
        });
        const event = await newEvent.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create event.', error: err.message });
    }
});

// --- 2. GET ALL ACTIVE EVENTS ---
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find({ user_id: req.user.id, status: 'active' }).sort({ date_created: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Fetch error.' });
    }
});

// --- 3. GET SINGLE EVENT DETAILS ---
router.get('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event || event.user_id.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Event not found or unauthorized.' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// --- 4. GENERAL UPDATE EVENT ---
router.put('/:id', protect, async (req, res) => {
    try {
        const { title, type, target_amount, members } = req.body;
        if (members && members.length > 15) {
            return res.status(400).json({ message: "Maximum 15 members only." });
        }
        const cleanedMembers = members.map(m => ({
            name: m.name,
            avatar: m.avatar,
            amount_paid: m.amount_paid || 0,
            is_paid: m.is_paid || false,
            payments: m.payments || [] 
        }));

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id },
            { $set: { title: title.trim(), type, target_amount: parseFloat(target_amount), members: cleanedMembers } },
            { new: true, runValidators: true }
        );

        if (!updatedEvent) return res.status(404).json({ message: "Event not found." });
        res.json(updatedEvent);
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});

// --- 5. ADD CONTRIBUTION ---
router.put('/:id/member/:member_id/pay', protect, async (req, res) => {
    try {
        const { amount } = req.body;
        const payAmount = parseFloat(amount);
        const event = await Event.findById(req.params.id);
        const member = event.members.id(req.params.member_id);
        member.payments.push({ amount: payAmount, date: new Date() });
        member.amount_paid += payAmount;

        if (event.type === 'fixed') {
            const quota = event.target_amount / event.members.length;
            member.is_paid = member.amount_paid >= quota;
        } else {
            member.is_paid = member.amount_paid > 0;
        }
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: "Payment failed." });
    }
});

// --- 6. DELETE PAYMENT ---
router.delete('/:id/member/:member_id/payment/:payment_id', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const member = event.members.id(req.params.member_id);
        const payment = member.payments.id(req.params.payment_id);
        member.amount_paid -= payment.amount;
        payment.deleteOne();
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: "Undo failed." });
    }
});

// --- 7. ARCHIVE EVENT ---
router.delete('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.id }, 
            { status: 'archived' },
            { new: true }
        );
        res.json({ message: 'Event archived.' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed.' });
    }
});

module.exports = router;