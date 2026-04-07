const express = require('express');
const router = express.Router();
const { getPlacementReady, getStudentProfile, getStats } = require('../controllers/placementController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('placement', 'admin'), getPlacementReady);
router.get('/stats', protect, authorize('placement', 'admin'), getStats);
router.get('/:id', protect, authorize('placement', 'admin'), getStudentProfile);

module.exports = router;
