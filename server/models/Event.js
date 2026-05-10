const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String 
  },
  type: { 
    type: String, 
    enum: ['fixed', 'flexible'], 
    required: true 
  },
  target_amount: { 
    type: Number, 
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  members: {
    type: [{
      name: { type: String, required: true },
      amount_paid: { type: Number, default: 0 },
      is_paid: { type: Boolean, default: false }
    }],
    validate: [arrayLimit, 'A group event is limited to a maximum of 15 members only.']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  date_created: { 
    type: Date, 
    default: Date.now 
  }
});

// Custom validation function para sa 15 members limit
function arrayLimit(val) {
  return val.length <= 15;
}

module.exports = mongoose.model('Event', EventSchema);