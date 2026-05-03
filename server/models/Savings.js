const mongoose = require('mongoose');

const SavingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    expense_ref_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }, 
    date_added: { type: Date, default: Date.now }
});

// Gawin nating 'Savings' ito para mag-match sa routes
module.exports = mongoose.model('Savings', SavingSchema);