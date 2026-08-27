const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }, // Null initially until accepted
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    isEmergency: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'OnTheWay', 'Arrived', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    scheduledDate: { type: Date, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    priceEstimate: { type: Number, required: true },
    finalPrice: { type: Number },
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash'], default: 'Cash' },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    financialBreakdown: {
        workerEarnings: { type: Number },
        cooperativeShare: { type: Number },
        welfareShare: { type: Number }
    },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    invoiceSent: { type: Boolean, default: false },
    notes: { type: String }
}, { timestamps: true });

bookingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);
