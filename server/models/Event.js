const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now } // Record exactly when they paid
});

const EventSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  type: { type: String, enum: ['fixed', 'flexible'], required: true },
  target_amount: { type: Number, required: true },
  members: [{
    name: { type: String, required: true },
    amount_paid: { type: Number, default: 0 },
    is_paid: { type: Boolean, default: false },
    payments: [PaymentSchema] // DITO NATITIPON ANG HISTORY
  }],
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  date_created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);