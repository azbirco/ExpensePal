const express = require('express');
const router = express.Router();
const db = require('../db');
const { protect } = require('../middleware/authMiddleware');

// 1. GET ALL ACTIVE EXPENSES
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT e.*, c.category_name, c.category_color 
             FROM expenses e 
             JOIN categories c ON e.category_id = c.category_id 
             WHERE e.user_id = ? AND e.is_archived = 0
             ORDER BY e.date_added DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching expenses", error: err.message });
    }
});

// 2. GET ARCHIVED EXPENSES
router.get('/archived', protect, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT e.*, c.category_name, c.category_color 
             FROM expenses e 
             JOIN categories c ON e.category_id = c.category_id 
             WHERE e.user_id = ? AND e.is_archived = 1
             ORDER BY e.date_added DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching archived items", error: err.message });
    }
});

// 3. GET ARCHIVED COUNT
router.get('/archived-count', protect, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND is_archived = 1',
            [req.user.id]
        );
        res.json({ count: rows[0].count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. ADD NEW EXPENSE
router.post('/add', protect, async (req, res) => {
    const { category_id, item_name, amount } = req.body;
    
    if (!category_id || !item_name || !amount) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Kunin ang user details para sa labor hours computation
        const [userRows] = await db.execute('SELECT username, monthly_salary, work_hours_per_month FROM users WHERE user_id = ?', [req.user.id]);
        const { username, monthly_salary, work_hours_per_month } = userRows[0];
        
        const safeHours = work_hours_per_month || 160; 
        const hourly_rate = monthly_salary / safeHours;
        const labor_hours = parseFloat(amount) / hourly_rate;

        // Kunin ang category name para sa report table sync
        const [catRows] = await db.execute('SELECT category_name FROM categories WHERE category_id = ?', [category_id]);
        const category_name = catRows[0]?.category_name || 'Uncategorized';

        // Insert sa Expenses table
        const [result] = await db.execute(
            `INSERT INTO expenses (user_id, category_id, item_name, amount, labor_hours_equivalent, hourly_rate_at_recording, is_archived) VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [req.user.id, category_id, item_name, amount, labor_hours, hourly_rate]
        );
        
        const newId = result.insertId;

        // Insert sa UserExpenseReport table
        await db.execute(
            `INSERT INTO userexpensereport (username, item_name, category_id, category_name, amount, labor_hours_equivalent, expense_ref_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [username, item_name, category_id, category_name, amount, labor_hours, newId]
        );

        // Kung ang category ay Savings (Category ID 7), i-insert sa savings table
        if (parseInt(category_id) === 7) {
            await db.execute('INSERT INTO savings (user_id, amount, description, expense_ref_id) VALUES (?, ?, ?, ?)', [req.user.id, amount, item_name, newId]);
        }

        res.status(201).json({ message: "Expense added successfully!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 5. UPDATE EXPENSE
router.put('/update/:id', protect, async (req, res) => {
    const { item_name, amount, category_id } = req.body;
    const expense_id = req.params.id;

    try {
        // Fetch original rate for accurate labor hour calculation
        const [oldData] = await db.execute('SELECT hourly_rate_at_recording FROM expenses WHERE expense_id = ?', [expense_id]);
        if (oldData.length === 0) return res.status(404).json({ message: "Record not found" });
        
        const rate = oldData[0].hourly_rate_at_recording;
        const newLaborHours = parseFloat(amount) / rate;

        // Fetch category name for table sync
        const [catRows] = await db.execute('SELECT category_name FROM categories WHERE category_id = ?', [category_id]);
        const category_name = catRows[0]?.category_name || 'Uncategorized';

        // Update Expenses table
        await db.execute(
            `UPDATE expenses SET item_name = ?, amount = ?, category_id = ?, labor_hours_equivalent = ? WHERE expense_id = ?`,
            [item_name, amount, category_id, newLaborHours, expense_id]
        );

        // Update UserExpenseReport table
        await db.execute(
            `UPDATE userexpensereport SET item_name = ?, amount = ?, category_id = ?, category_name = ?, labor_hours_equivalent = ? WHERE expense_ref_id = ?`,
            [item_name, amount, category_id, category_name, newLaborHours, expense_id]
        );

        // Update Savings table
        await db.execute('UPDATE savings SET amount = ?, description = ? WHERE expense_ref_id = ?', [amount, item_name, expense_id]);

        res.json({ message: "Record updated successfully!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 6. ARCHIVE (Soft Delete)
router.put('/archive/:id', protect, async (req, res) => {
    try {
        await db.execute('UPDATE expenses SET is_archived = 1 WHERE expense_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Item moved to Archive" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 7. RESTORE FROM ARCHIVE
router.put('/restore/:id', protect, async (req, res) => {
    try {
        await db.execute('UPDATE expenses SET is_archived = 0 WHERE expense_id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: "Item restored from Archive" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 8. PERMANENT DELETE
router.delete('/delete/:id', protect, async (req, res) => {
    try {
        const id = req.params.id;
        // Burahin sa lahat ng connected tables
        await db.execute('DELETE FROM savings WHERE expense_ref_id = ?', [id]);
        await db.execute('DELETE FROM userexpensereport WHERE expense_ref_id = ?', [id]);
        await db.execute('DELETE FROM expenses WHERE expense_id = ? AND user_id = ?', [id, req.user.id]);
        
        res.json({ message: "Record permanently deleted" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;