const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
