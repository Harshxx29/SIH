const express = require('express');
const router = express.Router();
const { registerWorker, getWorkerProfile, updateWorkerProfile, getWorkers, updateWorkerStatus, getNearbyWorkers } = require('../controllers/workerController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register', authMiddleware, authorizeRoles('Worker'), registerWorker);
router.get('/profile', authMiddleware, authorizeRoles('Worker'), getWorkerProfile);
router.put('/profile', authMiddleware, authorizeRoles('Worker'), updateWorkerProfile);
router.put('/status', authMiddleware, authorizeRoles('Worker'), updateWorkerStatus);
router.get('/nearby', authMiddleware, getNearbyWorkers);
router.get('/', authMiddleware, authorizeRoles('SuperAdmin'), getWorkers);

module.exports = router;
