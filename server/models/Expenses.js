const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    item_name: { type: String, required: true },
    amount: { type: Number, required: true },
    labor_hours_equivalent: { type: Number },
    hourly_rate_at_recording: { type: Number },
    is_archived: { type: Boolean, default: false },
    date_added: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);