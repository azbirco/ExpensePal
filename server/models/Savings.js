// server/models/Savings.js
const mongoose = require('mongoose');

const SavingSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    target_amount: { 
        type: Number, 
        default: 0 // Optional target, defaults to 0 (Continuous Savings)
    },
    isArchived: { 
        type: Boolean, 
        default: false // Para sa soft-delete/archive logic
    },
    expense_ref_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Expenses' 
    }, 
    date_added: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Savings', SavingSchema);