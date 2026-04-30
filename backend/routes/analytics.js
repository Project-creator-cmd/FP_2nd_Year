const express = require('express');
const router = express.Router();
const { getDepartmentAnalytics, getAdminOverview } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/department', protect, authorize('faculty', 'admin', 'placement', 'dept_head'), getDepartmentAnalytics);
router.get('/overview', protect, authorize('admin'), getAdminOverview);

module.exports = router;
