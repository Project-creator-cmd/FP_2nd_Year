const express = require('express');
const router = express.Router();
const { upload: uploadAchievement, getDepartmentAchievements, getMyAchievements, getAll, verify, deleteAchievement } = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.post('/', protect, authorize('student', 'faculty'), upload.single('certificate'), uploadAchievement);
router.get('/my', protect, authorize('student', 'faculty'), getMyAchievements);
router.get('/department', protect, authorize('faculty', 'admin'), getDepartmentAchievements);
router.get('/all', protect, authorize('admin'), getAll);
router.put('/:id/verify', protect, authorize('faculty', 'admin'), verify);
router.delete('/:id', protect, deleteAchievement);

module.exports = router;
