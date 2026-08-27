const mongoose = require('mongoose');

const federationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Federation', federationSchema);
