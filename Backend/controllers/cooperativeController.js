const Cooperative = require('../models/Cooperative');

const createCooperative = async (req, res) => {
    try {
        const { name, registrationNumber, address, contactEmail, contactPhone } = req.body;
        const cooperative = await Cooperative.create({ name, registrationNumber, address, contactEmail, contactPhone });
        res.status(201).json({ success: true, cooperative });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCooperatives = async (req, res) => {
    try {
        const coops = await Cooperative.find({});
        res.json(coops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCooperative = async (req, res) => {
    try {
        const coop = await Cooperative.findById(req.params.id);
        if (!coop) return res.status(404).json({ success: false, message: 'Cooperative not found' });
        res.json({ success: true, coop });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateCooperative = async (req, res) => {
    try {
        const { name, registrationNumber, address, contactEmail, contactPhone } = req.body;
        const coop = await Cooperative.findByIdAndUpdate(
            req.params.id, 
            { name, registrationNumber, address, contactEmail, contactPhone }, 
            { new: true }
        );
        res.json({ success: true, coop });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const Worker = require('../models/Worker');
        const Booking = require('../models/Booking');
        
        const workersCount = await Worker.countDocuments({ isVerified: true });
        const bookings = await Booking.find({ status: 'Completed' });
        
        const totalDisbursed = bookings.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
        
        res.json({
            success: true,
            workersCount,
            totalDisbursed
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createCooperative, getCooperatives, getCooperative, updateCooperative, getStats };
