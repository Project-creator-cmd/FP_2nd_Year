const express = require('express');
const router = express.Router();
const { getRules, createRule, updateRule, deleteRule, recalculateAll, seedDefaultRules } = require('../controllers/scoringController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getRules);
router.post('/', protect, authorize('admin'), createRule);
router.put('/:id', protect, authorize('admin'), updateRule);
router.delete('/:id', protect, authorize('admin'), deleteRule);
router.post('/recalculate', protect, authorize('admin'), recalculateAll);
router.post('/seed', protect, authorize('admin'), seedDefaultRules);

module.exports = router;
