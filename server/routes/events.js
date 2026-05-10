const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/authMiddleware'); // FIX: Correct direct import

// @route    POST /api/events
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, target_amount, members } = req.body;
    const newEvent = new Event({
      user_id: req.user.id, 
      title,
      description,
      type,
      target_amount,
      members 
    });
    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error("POST /api/events Error:", err.message);
    res.status(500).send('Server Error: Could not create event.');
  }
});

// @route    GET /api/events
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ 
      user_id: req.user.id, 
      status: 'active' 
    }).sort({ date_created: -1 });
    res.json(events);
  } catch (err) {
    console.error("GET /api/events Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET /api/events/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    if (event.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    res.json(event);
  } catch (err) {
    console.error("GET /api/events/:id Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT /api/events/:id/member/:member_id
router.put('/:id/member/:member_id', auth, async (req, res) => {
  try {
    const { amount_paid, is_paid } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    if (event.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    const member = event.members.id(req.params.member_id);
    if (!member) return res.status(404).json({ msg: 'Member not found' });
    if (amount_paid !== undefined) member.amount_paid = amount_paid;
    if (is_paid !== undefined) member.is_paid = is_paid;
    await event.save();
    res.json(event);
  } catch (err) {
    console.error("PUT member Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE /api/events/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    if (event.user_id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    event.status = 'archived';
    await event.save();
    res.json({ msg: 'Event moved to archive' });
  } catch (err) {
    console.error("DELETE event Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;