const User = require('../models/User');

exports.getDepartmentLeaderboard = async (req, res) => {
  try {
    const dept = req.query.department || req.user.department;
    const { year, limit = 20, page = 1 } = req.query;
    const filter = { role: 'student', department: dept };
    if (year) filter.year = parseInt(year);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const students = await User.find(filter)
      .sort({ totalScore: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('name rollNumber totalScore placementReady year section avatar');
    const total = await User.countDocuments(filter);
    const ranked = students.map((s, i) => ({ ...s.toObject(), rank: skip + i + 1 }));
    res.json({ success: true, data: ranked, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .sort({ totalScore: -1 })
      .limit(50)
      .select('name rollNumber department totalScore placementReady year avatar');
    const ranked = students.map((s, i) => ({ ...s.toObject(), rank: i + 1 }));
    res.json({ success: true, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyRank = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('totalScore department');
    const rank = await User.countDocuments({
      role: 'student',
      department: user.department,
      totalScore: { $gt: user.totalScore }
    }) + 1;
    const globalRank = await User.countDocuments({
      role: 'student',
      totalScore: { $gt: user.totalScore }
    }) + 1;
    res.json({ success: true, data: { rank, globalRank, totalScore: user.totalScore } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
