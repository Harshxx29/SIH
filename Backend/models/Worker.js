const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cooperative: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' },
    skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    experienceYears: { type: Number, default: 0 },
    hourlyRate: { type: Number, required: true },
    serviceRadiusKm: { type: Number, default: 10 },
    verificationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    rejectionReason: { type: String },
    isVerified: { type: Boolean, default: false },
    kycDocuments: [{
        documentType: String,
        documentUrl: String,
        isVerified: { type: Boolean, default: false }
    }],
    availability: {
        isOnline: { type: Boolean, default: false },
        workingHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '18:00' }
        }
    },
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    jobsCompleted: { type: Number, default: 0 },
    rating: {
        averageScore: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 }
    }
}, { timestamps: true });

workerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Worker', workerSchema);
