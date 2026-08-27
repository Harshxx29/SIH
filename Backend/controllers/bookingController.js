const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const User = require('../models/User');
const { sendInvoice } = require('../services/emailService');

const createBooking = async (req, res) => {
    try {
        const customerId = req.user?.id || req.user?._id || req.user?.userId || req.userId;
        const { workerId, serviceId, scheduledDate, location, notes, isEmergency, paymentMethod } = req.body;
        
        let calculatedPrice = req.body.priceEstimate || 350;
        if (serviceId) {
            const Service = require('../models/Service');
            const serviceObj = await Service.findById(serviceId);
            if (serviceObj && serviceObj.basePrice) {
                calculatedPrice = serviceObj.basePrice;
            }
        }
        
        const booking = await Booking.create({
            customer: customerId,
            worker: workerId || null,
            service: serviceId,
            status: 'Pending',
            isEmergency: isEmergency || false,
            scheduledDate: scheduledDate || new Date(),
            location: location || { type: 'Point', coordinates: [0,0] },
            priceEstimate: calculatedPrice,
            paymentMethod: paymentMethod || 'Cash',
            notes
        });

        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name phone email')
            .populate('worker')
            .populate('service', 'name');
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyBookings = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId || req.userId;
        const role = req.user?.role;
        let query = {};
        
        if (role === 'Customer') {
            query.customer = userId;
        } else if (role === 'Worker') {
            const worker = await Worker.findOne({ user: userId });
            if (worker) {
                const isVerified = worker.verificationStatus === 'Approved' && worker.isVerified && (worker.kycDocuments && worker.kycDocuments.length > 0);
                if (!isVerified) {
                    // Unverified workers cannot view live incoming requests
                    query.worker = worker._id;
                } else {
                    query.$or = [
                        { worker: worker._id },
                        { worker: null, status: 'Pending' }
                    ];
                }
            } else {
                return res.json({ success: true, bookings: [] });
            }
        }
        
        const bookings = await Booking.find(query)
            .populate('customer', 'name phone email')
            .populate('service', 'name')
            .populate({ path: 'worker', populate: { path: 'user', select: 'name phone' } })
            .sort({ createdAt: -1 });
            
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        
        if (booking.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Cannot cancel an assigned or in-progress booking' });
        }
        
        booking.status = 'Cancelled';
        await booking.save();
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const acceptBooking = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId || req.userId;
        const worker = await Worker.findOne({ user: userId });
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker profile not found' });
        }
        if (worker.verificationStatus !== 'Approved' || !worker.isVerified) {
            return res.status(403).json({ 
                success: false, 
                message: 'Your documents are still under verification by the cooperative. You cannot accept requests until approved.' 
            });
        }
        const { id } = req.params;
        const updateData = { status: 'Assigned', worker: worker._id };
        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const rejectBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndUpdate(id, { status: 'Cancelled' }, { new: true });
        
        // Notify customer that the worker declined
        if (req.io) {
            req.io.emit('booking:cancelled', { bookingId: id });
        }
        
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Allows transitioning to OnTheWay, Arrived, InProgress
        const validStatuses = ['OnTheWay', 'Arrived', 'InProgress'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status update' });
        }
        
        const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const completeBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('customer');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        const finalPrice = req.body.finalPrice || booking.priceEstimate;
        
        // Calculate financial breakdown
        const workerEarnings = finalPrice * 0.85;
        const cooperativeShare = finalPrice * 0.10;
        const welfareShare = finalPrice * 0.05;

        booking.status = 'Completed';
        booking.paymentStatus = 'Paid';
        booking.finalPrice = finalPrice;
        booking.financialBreakdown = { workerEarnings, cooperativeShare, welfareShare };
        
        await booking.save();
        
        // Update worker jobsCompleted
        if (booking.worker) {
            await Worker.findByIdAndUpdate(booking.worker, { $inc: { jobsCompleted: 1 } });
        }

        // Send Invoice
        if (booking.customer && booking.customer.email) {
            await sendInvoice(booking.customer.email, booking);
            booking.invoiceSent = true;
            await booking.save();
        }

        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const submitReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;
        
        const booking = await Booking.findByIdAndUpdate(id, { rating, review }, { new: true });
        
        // Update worker average rating
        if (booking.worker) {
            const workerBookings = await Booking.find({ worker: booking.worker, rating: { $exists: true } });
            const totalRating = workerBookings.reduce((sum, b) => sum + b.rating, 0);
            const averageScore = totalRating / workerBookings.length;
            
            await Worker.findByIdAndUpdate(booking.worker, {
                'rating.averageScore': averageScore,
                'rating.totalReviews': workerBookings.length
            });
        }
        
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    createBooking, getBooking, getMyBookings, cancelBooking, 
    acceptBooking, rejectBooking, updateBookingStatus, completeBooking, submitReview
};
