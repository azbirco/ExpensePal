const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    user_password: { type: String, required: true }, // 'password_hash' sa ERD mo
    monthly_salary: { type: Number, default: 0 },
    work_hours_per_month: { type: Number, default: 160 },
    profile_photo: { type: String, default: "" }, // Handa na para sa Multer upload mo
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);