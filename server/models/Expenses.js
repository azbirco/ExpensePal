const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    category_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true 
    },
    item_name: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    // Dito sinesave ang full decimal value para sa accuracy
    labor_hours_equivalent: { 
        type: Number, 
        default: 0 
    },
    is_archived: { 
        type: Boolean, 
        default: false 
    },
    date_added: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Expenses', ExpenseSchema);