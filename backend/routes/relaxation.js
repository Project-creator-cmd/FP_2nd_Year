const express = require('express');
const router = express.Router();
const { create, getMyRequests, getDepartmentRequests, facultyAction, adminAction } = require('../controllers/relaxationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), create);
router.get('/my', protect, authorize('student'), getMyRequests);
router.get('/department', protect, authorize('faculty', 'admin'), getDepartmentRequests);
router.put('/:id/faculty', protect, authorize('faculty'), facultyAction);
router.put('/:id/admin', protect, authorize('admin'), adminAction);

module.exports = router;
