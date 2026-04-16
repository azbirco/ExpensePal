const express = require('express');
const router = express.Router();
const db = require('../db');

// Kunin lahat ng categories para sa dropdown sa frontend
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM categories');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching categories", error: err.message });
    }
});

module.exports = router;