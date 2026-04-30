const express = require('express');
const router = express.Router();
const { getRules, createRule, updateRule, deleteRule, recalculateAll, seedDefaultRules } = require('../controllers/scoringController');
const { protect, authorize, requireSameDept } = require('../middleware/auth');

router.get('/', protect, getRules);
router.post('/', protect, authorize('admin', 'dept_head'), requireSameDept, createRule);
router.put('/:id', protect, authorize('admin', 'dept_head'), updateRule);
router.delete('/:id', protect, authorize('admin', 'dept_head'), deleteRule);
router.post('/recalculate', protect, authorize('admin', 'dept_head'), requireSameDept, recalculateAll);
router.post('/seed', protect, authorize('admin', 'dept_head'), requireSameDept, seedDefaultRules);

module.exports = router;
