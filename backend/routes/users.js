const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Admin: full user list with optional filters
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Dept head: view users in their own department only
router.get('/my-department', protect, authorize('admin', 'dept_head'), async (req, res) => {
  try {
    const dept = req.user.role === 'admin' ? (req.query.department || null) : req.user.department;
    const filter = { role: { $in: ['student', 'faculty'] } };
    if (dept) filter.department = dept;
    if (req.query.role && ['student', 'faculty'].includes(req.query.role)) filter.role = req.query.role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Toggle active status — admin: any user; dept_head: only their department
router.put('/:id/toggle', protect, authorize('admin', 'dept_head'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role === 'dept_head' && user.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Cross-department access denied' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Update student attendance — faculty and dept_head only (students cannot self-update)
router.put('/:id/attendance', protect, authorize('faculty', 'dept_head', 'admin'), async (req, res) => {
  try {
    const { attendance } = req.body;
    if (attendance === undefined || attendance < 0 || attendance > 100) {
      return res.status(400).json({ success: false, message: 'Attendance must be 0-100' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.role !== 'student') return res.status(400).json({ success: false, message: 'Can only update student attendance' });
    if (req.user.role !== 'admin' && target.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Cross-department access denied' });
    }
    target.attendance = attendance;
    await target.save();
    res.json({ success: true, user: target });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Delete — admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
