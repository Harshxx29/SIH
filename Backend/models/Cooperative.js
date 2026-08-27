const mongoose = require('mongoose');

const cooperativeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    federation: { type: mongoose.Schema.Types.ObjectId, ref: 'Federation' },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    serviceAreas: [{ type: String }], // List of pincodes or city names
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Cooperative', cooperativeSchema);
