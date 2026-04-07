const ScoringRule = require('../models/ScoringRule');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

exports.getRules = async (req, res) => {
  try {
    const dept = req.query.department || req.user.department;
    const rules = await ScoringRule.find({ department: dept, isActive: true }).sort({ category: 1, level: 1 });
    res.json({ success: true, rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRule = async (req, res) => {
  try {
    const { department, category, level, position, points } = req.body;
    const existing = await ScoringRule.findOne({ department, category, level, position });
    if (existing) {
      existing.points = points;
      existing.isActive = true;
      await existing.save();
      return res.json({ success: true, rule: existing });
    }
    const rule = await ScoringRule.create({ department, category, level, position, points, createdBy: req.user.id });
    res.status(201).json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const rule = await ScoringRule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });
    res.json({ success: true, rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    await ScoringRule.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Rule deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.recalculateAll = async (req, res) => {
  try {
    const dept = req.body.department || req.user.department;
    const achievements = await Achievement.find({ department: dept, status: 'verified' });
    for (const a of achievements) {
      const rule = await ScoringRule.findOne({ department: a.department, category: a.category, level: a.level, position: a.position, isActive: true });
      a.score = rule ? rule.points : 0;
      await a.save();
    }
    const students = await User.find({ role: 'student', department: dept });
    for (const s of students) {
      const studentAchievements = achievements.filter(a => a.student.toString() === s._id.toString());
      s.totalScore = studentAchievements.reduce((sum, a) => sum + a.score, 0);
      s.placementReady = s.totalScore >= 100;
      await s.save();
    }
    res.json({ success: true, message: `Recalculated scores for ${achievements.length} achievements` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.seedDefaultRules = async (req, res) => {
  try {
    const dept = req.body.department;
    const defaults = [
      { category: 'academic', level: 'international', position: '1st', points: 100 },
      { category: 'academic', level: 'national', position: '1st', points: 75 },
      { category: 'academic', level: 'state', position: '1st', points: 50 },
      { category: 'technical', level: 'international', position: '1st', points: 90 },
      { category: 'technical', level: 'national', position: '1st', points: 70 },
      { category: 'technical', level: 'state', position: '1st', points: 45 },
      { category: 'technical', level: 'college', position: '1st', points: 25 },
      { category: 'certification', level: 'national', position: 'completed', points: 30 },
      { category: 'internship', level: 'national', position: 'completed', points: 40 },
      { category: 'research', level: 'national', position: 'published', points: 60 },
      { category: 'sports', level: 'national', position: '1st', points: 50 },
      { category: 'cultural', level: 'college', position: '1st', points: 15 },
    ];
    for (const d of defaults) {
      await ScoringRule.findOneAndUpdate(
        { department: dept, category: d.category, level: d.level, position: d.position },
        { ...d, department: dept, createdBy: req.user.id, isActive: true },
        { upsert: true }
      );
    }
    res.json({ success: true, message: 'Default scoring rules seeded' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
