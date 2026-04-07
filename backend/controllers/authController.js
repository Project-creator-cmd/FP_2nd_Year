const User = require('../models/User');
const { validationResult } = require('express-validator');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ success: true, token, user: userObj });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { name, email, password, role, department, rollNumber, year, section, phone, cgpa } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, department, rollNumber, year, section, phone, cgpa });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  const allowed = ['name', 'phone', 'cgpa', 'attendance'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  try {
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
