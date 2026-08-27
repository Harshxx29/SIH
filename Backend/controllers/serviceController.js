const Service = require('../models/Service');

const createService = async (req, res) => {
    try {
        const { name, description, category, basePrice } = req.body;
        const service = await Service.create({ name, description, category, basePrice });
        res.status(201).json({ success: true, service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getServices = async (req, res) => {
    try {
        const services = await Service.find({});
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const { name, description, category, basePrice } = req.body;
        const service = await Service.findByIdAndUpdate(
            req.params.id, 
            { name, description, category, basePrice }, 
            { new: true }
        );
        res.json({ success: true, service });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createService, getServices, getService, updateService, deleteService };
