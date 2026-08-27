const Worker = require('../models/Worker');
const Service = require('../models/Service');

const findNearbyWorkers = async (req, res) => {
    try {
        const { serviceName, location, radiusKm } = req.body;
        
        // Find service by name to get its ID
        let serviceQuery = {};
        if (serviceName) {
            const service = await Service.findOne({ name: { $regex: new RegExp(serviceName, 'i') } });
            if (service) {
                serviceQuery = { skills: service._id };
            }
        }
        
        let query = {
            verificationStatus: 'Approved',
            'availability.isOnline': true,
            ...serviceQuery
        };

        if (location && location.coordinates && location.coordinates.length === 2) {
            const maxDistance = (radiusKm || 15) * 1000; // default 15km
            query.currentLocation = {
                $near: {
                    $geometry: { type: 'Point', coordinates: location.coordinates },
                    $maxDistance: maxDistance
                }
            };
        }

        const workers = await Worker.find(query)
            .populate('user', 'name phone')
            .populate('skills', 'name basePrice')
            .limit(20);
        
        res.json({
            success: true,
            message: `Found ${workers.length} workers nearby`,
            workers: workers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { findNearbyWorkers };
