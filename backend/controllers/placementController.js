const User = require('../models/User');
const Achievement = require('../models/Achievement');

exports.getPlacementReady = async (req, res) => {
  try {
    const filter = { role: 'student', placementReady: true };
    if (req.query.department) filter.department = req.query.department;
    if (req.query.year) filter.year = parseInt(req.query.year);
    const students = await User.find(filter)
      .sort({ totalScore: -1 })
      .select('name rollNumber department year section totalScore cgpa phone email');
    const enriched = await Promise.all(students.map(async s => {
      const achievementCount = await Achievement.countDocuments({ student: s._id, status: 'verified' });
      return { ...s.toObject(), achievementCount };
    }));
    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student || student.role !== 'student') return res.status(404).json({ success: false, message: 'Student not found' });
    const achievements = await Achievement.find({ student: student._id, status: 'verified' }).sort({ score: -1 });
    res.json({ success: true, student, achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const departments = await User.distinct('department');
    const stats = await Promise.all(departments.map(async dept => {
      const total = await User.countDocuments({ role: 'student', department: dept });
      const ready = await User.countDocuments({ role: 'student', department: dept, placementReady: true });
      return { department: dept, total, ready, percentage: total ? Math.round((ready / total) * 100) : 0 };
    }));
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
