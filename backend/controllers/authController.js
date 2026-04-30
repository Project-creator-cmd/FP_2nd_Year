const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Roles that cannot self-register — must be created by admin
const PRIVILEGED_ROLES = ['admin', 'dept_head'];

/* ── token helpers ───────────────────────────────────────────── */

const ACCESS_EXPIRES  = '15m';
const REFRESH_EXPIRES = '7d';
const COOKIE_MAX_AGE  = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function signAccess(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

function signRefresh(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: REFRESH_EXPIRES }
  );
}

function setRefreshCookie(res, token) {
  res.cookie('acadex_refresh', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   COOKIE_MAX_AGE,
  });
}

function sendTokens(user, statusCode, res) {
  const accessToken  = signAccess(user);
  const refreshToken = signRefresh(user);
  setRefreshCookie(res, refreshToken);
  const userObj = user.toObject();
  delete userObj.password;
  res.status(statusCode).json({ success: true, token: accessToken, user: userObj });
}

/* ── register ────────────────────────────────────────────────── */

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { name, email, password, role, department, rollNumber, year, section, phone, cgpa } = req.body;

    // Block public self-registration for privileged roles
    if (PRIVILEGED_ROLES.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${role}' cannot self-register. Contact your administrator.`,
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, department, rollNumber, year, section, phone, cgpa });
    sendTokens(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── admin creates privileged user ──────────────────────────── */

exports.createPrivilegedUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!PRIVILEGED_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Use /register for non-privileged roles' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password: password || crypto.randomBytes(12).toString('hex'), role, department });
    const userObj = user.toObject(); delete userObj.password;
    res.status(201).json({ success: true, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── login ───────────────────────────────────────────────────── */

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    sendTokens(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── refresh token ───────────────────────────────────────────── */

exports.refreshToken = async (req, res) => {
  const token = req.cookies?.acadex_refresh;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh');
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'User not found or inactive' });
    const accessToken = signAccess(user);
    // Rotate refresh token
    const newRefresh = signRefresh(user);
    setRefreshCookie(res, newRefresh);
    res.json({ success: true, token: accessToken });
  } catch (err) {
    res.clearCookie('acadex_refresh');
    return res.status(401).json({ success: false, message: 'Refresh token invalid or expired' });
  }
};

/* ── logout ──────────────────────────────────────────────────── */

exports.logout = (req, res) => {
  res.clearCookie('acadex_refresh');
  res.json({ success: true, message: 'Logged out' });
};

/* ── getMe / updateProfile / changePassword ─────────────────── */

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

exports.updateProfile = async (req, res) => {
  // Students cannot update their own attendance — only faculty/dept_head can
  const allowed = ['name', 'phone', 'cgpa'];
  if (['faculty', 'dept_head', 'admin'].includes(req.user.role)) allowed.push('attendance');
  if (req.user.role === 'student') allowed.push('year', 'section');
  if (['faculty', 'dept_head'].includes(req.user.role)) allowed.push('designation');
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
    sendTokens(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
