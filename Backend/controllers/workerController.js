const Worker = require('../models/Worker');
const User = require('../models/User');

const registerWorker = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId || req.userId;
        const { skills, kycDocuments } = req.body;

        let worker = await Worker.findOne({ user: userId });
        if (worker) {
            return res.status(400).json({ success: false, message: 'Worker profile already exists' });
        }

        worker = await Worker.create({
            user: userId,
            skills: skills || [],
            hourlyRate: 350,
            kycDocuments: kycDocuments || [],
            verificationStatus: 'Pending',
            isVerified: false,
            availability: { isOnline: false }
        });

        res.status(201).json({ success: true, worker });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWorkerProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId || req.userId;
        let worker = await Worker.findOne({ user: userId })
            .populate('user', 'name email phone avatar address location')
            .populate('skills');

        if (!worker) {
            if (req.user?.role === 'Worker') {
                const Service = require('../models/Service');
                const services = await Service.find().limit(3);
                const defaultSkills = services.map(s => s._id);

                const newWorker = await Worker.create({
                    user: userId,
                    skills: defaultSkills,
                    hourlyRate: 350,
                    verificationStatus: 'Pending',
                    isVerified: false,
                    availability: { isOnline: false },
                    currentLocation: req.user?.location || { type: 'Point', coordinates: [77.2090, 28.6139] }
                });

                worker = await Worker.findById(newWorker._id)
                    .populate('user', 'name email phone avatar address location')
                    .populate('skills');
            } else {
                return res.status(404).json({ success: false, message: 'Worker profile not found' });
            }
        }

        // If worker has no KYC documents or was not verified by admin, ensure isVerified is false
        if (!worker.kycDocuments || worker.kycDocuments.length === 0) {
            if (worker.isVerified) {
                worker.isVerified = false;
                worker.verificationStatus = 'Pending';
                await worker.save();
            }
        }

        // Calculate Welfare & Stats
        const Booking = require('../models/Booking');
        const completedJobs = await Booking.find({ worker: worker._id, status: 'Completed' });

        let totalWelfareFund = 0;
        let totalEarnings = 0;

        completedJobs.forEach(b => {
            if (b.financialBreakdown) {
                totalWelfareFund += b.financialBreakdown.welfareShare || 0;
                totalEarnings += b.financialBreakdown.workerEarnings || 0;
            }
        });

        res.json({
            success: true,
            worker: {
                ...worker.toObject(),
                stats: {
                    completedJobsCount: completedJobs.length,
                    totalWelfareFund,
                    totalEarnings
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateWorkerProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId || req.userId;
        const { skills, experienceYears, serviceRadiusKm, kycDocuments } = req.body;

        const updateData = {};
        if (skills !== undefined) updateData.skills = skills;
        if (experienceYears !== undefined) updateData.experienceYears = Number(experienceYears);
        if (serviceRadiusKm !== undefined) updateData.serviceRadiusKm = Number(serviceRadiusKm);
        if (kycDocuments !== undefined) {
            updateData.kycDocuments = kycDocuments;
            updateData.verificationStatus = 'Pending';
            updateData.isVerified = false;
        }

        const worker = await Worker.findOneAndUpdate(
            { user: userId },
            updateData,
            { new: true }
        ).populate('skills').populate('user', 'name email phone avatar address');

        res.json({ success: true, worker });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateWorkerStatus = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.user?.userId || req.userId;
        const { isOnline, coordinates } = req.body;

        const worker = await Worker.findOne({ user: userId });
        if (!worker) {
            return res.status(404).json({ success: false, message: 'Worker profile not found' });
        }

        const isVerified = (worker.verificationStatus === 'Approved' && worker.isVerified && worker.kycDocuments && worker.kycDocuments.length > 0);
        if (!isVerified && isOnline) {
            return res.status(403).json({ success: false, message: 'Verification pending: You cannot go online until approved by the cooperative.' });
        }

        const updateData = { 'availability.isOnline': isVerified ? isOnline : false };
        if (coordinates && coordinates.length === 2) {
            updateData.currentLocation = { type: 'Point', coordinates };
        }

        const updatedWorker = await Worker.findOneAndUpdate(
            { user: userId },
            updateData,
            { new: true }
        ).populate('user', 'name phone').populate('skills', 'name');

        // Emit Socket.IO event
        if (req.io) {
            if (isVerified && isOnline) {
                req.io.emit('worker:online', {
                    workerId: updatedWorker._id,
                    name: updatedWorker.user.name,
                    skills: updatedWorker.skills,
                    rating: updatedWorker.rating?.averageScore || 5.0,
                    verified: updatedWorker.isVerified,
                    availability: updatedWorker.availability,
                    currentLocation: updatedWorker.currentLocation
                });
            } else {
                req.io.emit('worker:offline', { workerId: updatedWorker._id });
            }

            if (coordinates) {
                req.io.emit('worker:locationUpdated', {
                    workerId: updatedWorker._id,
                    coordinates: coordinates,
                    timestamp: new Date()
                });
            }
        }

        res.json({ success: true, worker: updatedWorker });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNearbyWorkers = async (req, res) => {
    try {
        const { lat, lng, radius = 5000 } = req.query; // default 5km

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
        }

        const workers = await Worker.find({
            'availability.isOnline': true,
            isVerified: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('user', 'name').populate('skills', 'name');

        res.json({ success: true, workers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWorkers = async (req, res) => {
    try {
        const workers = await Worker.find().populate('user', 'name phone').populate('skills', 'name');
        res.json({ success: true, workers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { registerWorker, getWorkerProfile, updateWorkerProfile, getWorkers, updateWorkerStatus, getNearbyWorkers };
