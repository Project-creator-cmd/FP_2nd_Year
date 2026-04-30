const express = require('express');
const router  = express.Router();
const {
  register, login, refreshToken, logout,
  getMe, updateProfile, changePassword,
  createPrivilegedUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');

// Public registration — privileged roles blocked inside controller
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').isIn(['student', 'faculty', 'admin', 'placement', 'dept_head', 'event_organizer']).withMessage('Invalid role'),
  body('department').notEmpty().withMessage('Department required'),
], register);

router.post('/login',   login);
router.post('/refresh', refreshToken);   // uses HTTP-only cookie
router.post('/logout',  protect, logout);

// Admin-only: create privileged users (admin, dept_head)
router.post('/create-user', protect, authorize('admin'), [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('role').isIn(['admin', 'dept_head']).withMessage('Only privileged roles here'),
  body('department').notEmpty().withMessage('Department required'),
], createPrivilegedUser);

router.get('/me',          protect, getMe);
router.put('/profile',     protect, updateProfile);
router.put('/password',    protect, changePassword);

module.exports = router;
