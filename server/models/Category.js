const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    category_name: { type: String, required: true },
    category_color: { type: String, default: "#94a3b8" },
    category_icon: { type: String } // Idinagdag ito
});

module.exports = mongoose.model('Category', CategorySchema);