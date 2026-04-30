const Achievement  = require('../models/Achievement');
const User         = require('../models/User');
const ScoringRule  = require('../models/ScoringRule');
const { cloudinary } = require('../config/cloudinary');
const { notify }   = require('../utils/notify');
const { sendEmail } = require('../utils/email');

/* ── helpers ─────────────────────────────────────────────────── */

const calculateScore = async (achievement) => {
  const rule = await ScoringRule.findOne({
    department: achievement.department,
    category:   achievement.category,
    level:      achievement.level,
    position:   achievement.position,
    isActive:   true,
  });
  return rule ? rule.points : 0;
};

const updateUserTotalScore = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;
  const achievements = await Achievement.find({ userId, status: 'verified' });
  const total = achievements.reduce((sum, a) => sum + (a.score || 0), 0);
  user.totalScore = total;
  if (user.role === 'student') user.placementReady = total >= 100;
  await user.save();
};

/* ── controllers ─────────────────────────────────────────────── */

exports.upload = async (req, res) => {
  try {
    const { title, description, category, level, position, date, organizingBody, eventId } = req.body;
    const achievementData = {
      userId:       req.user.id,
      userRole:     req.user.role,
      department:   req.user.department,
      title, description, category, level, position,
      date:         new Date(date),
      organizingBody,
    };
    if (req.file) {
      achievementData.certificateUrl      = req.file.path;
      achievementData.certificatePublicId = req.file.filename;
    }

    // Auto-match: if an eventId is provided, check if student's roll number is in participant list
    if (eventId) {
      const Event = require('../models/Event');
      const event = await Event.findById(eventId);
      if (event && event.parsedParticipants?.length) {
        const rollNumber = req.user.rollNumber || '';
        const name       = (req.user.name || '').toLowerCase();
        const matched    = event.parsedParticipants.some(
          p => p.toLowerCase() === rollNumber.toLowerCase() || p.toLowerCase() === name
        );
        achievementData.eventId     = eventId;
        achievementData.matchStatus = matched ? 'auto-matched' : 'manual-review';
      } else {
        achievementData.eventId = eventId;
      }
    }

    const achievement = await Achievement.create(achievementData);
    res.status(201).json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id })
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

    // faculty sees only student achievements; dept_head can filter by userRole
    if (req.user.role === 'faculty') {
      filter.userRole = 'student';
    } else if (req.query.userRole && ['student', 'faculty'].includes(req.query.userRole)) {
      filter.userRole = req.query.userRole;
    }

    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    // Pagination
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const [achievements, total] = await Promise.all([
      Achievement.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name role rollNumber year section')
        .populate('verifiedBy', 'name role'),
      Achievement.countDocuments(filter),
    ]);

    res.json({ success: true, achievements, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.status)     filter.status     = req.query.status;

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const [achievements, total] = await Promise.all([
      Achievement.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name role rollNumber department year')
        .populate('verifiedBy', 'name'),
      Achievement.countDocuments(filter),
    ]);

    res.json({ success: true, achievements, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const { action, rejectionReason, remarks } = req.body;
    const achievement = await Achievement.findById(req.params.id).populate('userId', 'name email');
    if (!achievement) return res.status(404).json({ success: false, message: 'Achievement not found' });

    if (achievement.department !== req.user.department && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (achievement.userRole === 'faculty' && !['admin', 'dept_head'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only dept_head or admin can verify faculty achievements' });
    }

    if (action === 'verify') {
      achievement.status         = 'verified';
      achievement.verifiedBy     = req.user.id;
      achievement.verifiedAt     = new Date();
      achievement.remarks        = remarks;
      achievement.verifiedByRole = req.user.role;
      achievement.score          = await calculateScore(achievement);
      await achievement.save();
      await updateUserTotalScore(achievement.userId._id);

      // In-app notification
      await notify(
        achievement.userId._id,
        `Your achievement "${achievement.title}" has been verified! You earned ${achievement.score} points.`,
        'achievement_verified',
        { achievementId: achievement._id }
      );
      // Email notification
      await sendEmail(
        achievement.userId.email,
        'Achievement Verified - Acadex',
        `<p>Hi ${achievement.userId.name},</p>
         <p>Your achievement <strong>${achievement.title}</strong> has been verified and you earned <strong>${achievement.score} points</strong>.</p>
         <p>Keep up the great work!</p>`
      );
    } else if (action === 'reject') {
      achievement.status          = 'rejected';
      achievement.rejectionReason = rejectionReason;
      achievement.verifiedBy      = req.user.id;
      achievement.verifiedAt      = new Date();
      achievement.verifiedByRole  = req.user.role;
      await achievement.save();

      await notify(
        achievement.userId._id,
        `Your achievement "${achievement.title}" was rejected. Reason: ${rejectionReason || 'No reason provided.'}`,
        'achievement_rejected',
        { achievementId: achievement._id }
      );
      await sendEmail(
        achievement.userId.email,
        'Achievement Update - Acadex',
        `<p>Hi ${achievement.userId.name},</p>
         <p>Your achievement <strong>${achievement.title}</strong> was not approved.</p>
         <p><strong>Reason:</strong> ${rejectionReason || 'No reason provided.'}</p>`
      );
    }

    res.json({ success: true, achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) return res.status(404).json({ success: false, message: 'Not found' });
    if (achievement.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (achievement.certificatePublicId) {
      await cloudinary.uploader.destroy(achievement.certificatePublicId);
    }
    await achievement.deleteOne();
    await updateUserTotalScore(achievement.userId);
    res.json({ success: true, message: 'Achievement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
