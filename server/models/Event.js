const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event_name: { type: String, required: true },
    event_type: { type: String }, // e.g., Birthday, Wedding
    target_budget: { type: Number, default: 0 },
    participants: [{ 
        participant_name: String,
        amount_paid: { type: Number, default: 0 }
    }], // "Embedded" na natin ang participants para mas simple sa MongoDB
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);