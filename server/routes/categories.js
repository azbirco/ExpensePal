const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // Import Mongoose Model

// Kunin lahat ng categories para sa dropdown sa frontend
router.get('/', async (req, res) => {
    try {
        // .find() ay katumbas ng SELECT * FROM
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "Error fetching categories", error: err.message });
    }
});

module.exports = router;