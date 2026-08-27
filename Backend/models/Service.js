const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., 'Electrician', 'Plumber'
    description: { type: String },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true },
    iconUrl: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
