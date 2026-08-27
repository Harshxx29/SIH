const express = require('express');
const router = express.Router();
const { createService, getServices, getService, updateService, deleteService } = require('../controllers/serviceController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getServices);
router.post('/', authMiddleware, authorizeRoles('SuperAdmin'), createService);
router.get('/:id', getService);
router.put('/:id', authMiddleware, authorizeRoles('SuperAdmin'), updateService);
router.delete('/:id', authMiddleware, authorizeRoles('SuperAdmin'), deleteService);

module.exports = router;
