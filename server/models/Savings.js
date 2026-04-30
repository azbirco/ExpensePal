const mongoose = require('mongoose');

const SavingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    expense_ref_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }, // Link back sa expense entry
    date_added: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Saving', SavingSchema);