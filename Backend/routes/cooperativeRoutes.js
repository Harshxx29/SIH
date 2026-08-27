const express = require('express');
const router = express.Router();
const coopController = require('../controllers/cooperativeController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/public/stats', coopController.getStats);
router.get('/', coopController.getCooperatives);
router.post('/', authMiddleware, authorizeRoles('CooperativeAdmin', 'FederationAdmin', 'SuperAdmin'), coopController.createCooperative);
router.get('/:id', coopController.getCooperative);
router.put('/:id', authMiddleware, authorizeRoles('CooperativeAdmin', 'FederationAdmin', 'SuperAdmin'), coopController.updateCooperative);

module.exports = router;
