const express = require('express');
const router = express.Router();
const { getDashboard, verifyWorker } = require('../controllers/adminController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, authorizeRoles('SuperAdmin'), getDashboard);
router.put('/workers/:id/verify', authMiddleware, authorizeRoles('SuperAdmin'), verifyWorker);

module.exports = router;
