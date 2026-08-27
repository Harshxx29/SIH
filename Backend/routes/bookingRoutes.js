const express = require('express');
const router = express.Router();
const { 
    createBooking, getBooking, getMyBookings, cancelBooking, 
    acceptBooking, rejectBooking, updateBookingStatus, completeBooking, submitReview 
} = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getMyBookings);
router.get('/:id', authMiddleware, getBooking);
router.post('/:id/cancel', authMiddleware, cancelBooking);
router.put('/:id/accept', authMiddleware, acceptBooking);
router.put('/:id/reject', authMiddleware, rejectBooking);
router.put('/:id/status', authMiddleware, updateBookingStatus);
router.put('/:id/complete', authMiddleware, completeBooking);
router.post('/:id/review', authMiddleware, submitReview);

// Moved finding workers to a separate route file or kept in booking if required by frontend
const { findNearbyWorkers } = require('../controllers/geoMatchingController');
router.post('/find-workers', findNearbyWorkers);

module.exports = router;
