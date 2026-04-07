const Achievement = require('../models/Achievement');
const User = require('../models/User');
const ScoringRule = require('../models/ScoringRule');
const { cloudinary } = require('../config/cloudinary');

const calculateScore = async (achievement) => {
  const rule = await ScoringRule.findOne({
    department: achievement.department,
    category: achievement.category,
    level: achievement.level,
    position: achievement.position,
    isActive: true
  });
  return rule ? rule.points : 0;
};

const updateStudentTotalScore = async (studentId) => {
  const achievements = await Achievement.find({ student: studentId, status: 'verified' });
  const total = achievements.reduce((sum, a) => sum + (a.score || 0), 0);
  const placementReady = total >= 100;
  await User.findByIdAndUpdate(studentId, { totalScore: total, placementReady });
};

exports.upload = async (req, res) => {
  try {
    const { title, description, category, level, position, date, organizingBody } = req.body;
    const achievementData = {
      student: req.user.id,
      department: req.user.department,
      title, description, category, level, position,
      date: new Date(date),
      organizingBody
    };
    if (req.file) {
      achievementData.certificateUrl = req.file.path;
      achievementData.certificatePublicId = req.file.filename;
    }
    const achievement = await Achievement.create(achievementData);
    res.status(201).json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .populate('verifiedBy', 'name');
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDepartmentAchievements = async (req, res) => {
  try {
    const filter = { department: req.user.department };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    const achievements = await Achievement.find(filter)
      .sort({ createdAt: -1 })
      .populate('student', 'name rollNumber year section')
      .populate('verifiedBy', 'name');
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status) filter.status = req.query.status;
    const achievements = await Achievement.find(filter)
      .sort({ createdAt: -1 })
      .populate('student', 'name rollNumber department year')
      .populate('verifiedBy', 'name');
    res.json({ success: true, achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason, remarks } = req.body;
    const achievement = await Achievement.findById(id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });
    if (achievement.department !== req.user.department && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (action === 'verify') {
      achievement.status = 'verified';
      achievement.verifiedBy = req.user.id;
      achievement.verifiedAt = new Date();
      achievement.remarks = remarks;
      achievement.score = await calculateScore(achievement);
    } else if (action === 'reject') {
      achievement.status = 'rejected';
      achievement.rejectionReason = rejectionReason;
      achievement.verifiedBy = req.user.id;
      achievement.verifiedAt = new Date();
    }
    await achievement.save();
    if (action === 'verify') await updateStudentTotalScore(achievement.student);
    res.json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Not found' });
    if (achievement.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (achievement.certificatePublicId) {
      await cloudinary.uploader.destroy(achievement.certificatePublicId);
    }
    await achievement.deleteOne();
    await updateStudentTotalScore(achievement.student);
    res.json({ success: true, message: 'Achievement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
