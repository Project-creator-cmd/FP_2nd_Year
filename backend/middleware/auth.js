const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Role '${req.user.role}' not authorized` });
  }
  next();
};

// Allows admin full access; dept_head and faculty scoped to their own department
exports.sameDepartment = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.targetUser && req.user.department !== req.targetUser.department) {
    return res.status(403).json({ success: false, message: 'Cross-department access denied' });
  }
  next();
};

// Enforces department scope for dept_head on any route that touches department-level data.
// Admin bypasses. dept_head must match their own department.
// Reads department from: req.body.department, req.query.department, or req.params.dept
exports.requireSameDept = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  const requestedDept =
    req.body.department ||
    req.query.department ||
    req.params.dept ||
    null;
  // If a specific department is requested, it must match the user's department
  if (requestedDept && requestedDept !== req.user.department) {
    return res.status(403).json({ success: false, message: 'Cross-department access denied' });
  }
  // Force the department to the user's own department in the request
  req.body.department = req.user.department;
  next();
};
