const User       = require('../models/User');
const Achievement = require('../models/Achievement');
const { Parser } = require('json2csv');

/* ── department leaderboard ──────────────────────────────────── */
exports.getDepartmentLeaderboard = async (req, res) => {
  try {
    const dept   = req.query.department || req.user.department;
    const { year, section, search } = req.query;
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 50);
    const skip   = (page - 1) * limit;

    const filter = { role: 'student', department: dept };
    if (year)    filter.year    = parseInt(year);
    if (section) filter.section = section;
    if (search)  filter.$or = [
      { name:       { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];

    const [students, total] = await Promise.all([
      User.find(filter).sort({ totalScore: -1 }).skip(skip).limit(limit)
        .select('name rollNumber totalScore placementReady year section cgpa'),
      User.countDocuments(filter),
    ]);

    // Enrich with achievement count
    const ranked = await Promise.all(students.map(async (s, i) => {
      const achievementCount = await Achievement.countDocuments({ userId: s._id, status: 'verified' });
      return { ...s.toObject(), rank: skip + i + 1, achievementCount };
    }));

    res.json({ success: true, data: ranked, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── global leaderboard (admin / placement) ──────────────────── */
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { year, search, placementReady } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const filter = { role: 'student' };
    if (req.query.department) filter.department = req.query.department;
    if (year)           filter.year           = parseInt(year);
    if (placementReady === 'true') filter.placementReady = true;
    if (search) filter.$or = [
      { name:       { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];

    const [students, total] = await Promise.all([
      User.find(filter).sort({ totalScore: -1 }).skip(skip).limit(limit)
        .select('name rollNumber department totalScore placementReady year section cgpa email phone'),
      User.countDocuments(filter),
    ]);

    const ranked = await Promise.all(students.map(async (s, i) => {
      const achievementCount = await Achievement.countDocuments({ userId: s._id, status: 'verified' });
      return { ...s.toObject(), rank: skip + i + 1, achievementCount };
    }));

    res.json({ success: true, data: ranked, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── my rank (student only) ──────────────────────────────────── */
exports.getMyRank = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('totalScore department');
    const [rank, globalRank] = await Promise.all([
      User.countDocuments({ role: 'student', department: user.department, totalScore: { $gt: user.totalScore } }),
      User.countDocuments({ role: 'student', totalScore: { $gt: user.totalScore } }),
    ]);
    res.json({ success: true, data: { rank: rank + 1, globalRank: globalRank + 1, totalScore: user.totalScore } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── CSV export ──────────────────────────────────────────────── */
exports.exportLeaderboard = async (req, res) => {
  try {
    const dept   = req.query.department || req.user.department;
    const filter = { role: 'student' };
    if (dept !== 'all') filter.department = dept;
    if (req.query.year) filter.year = parseInt(req.query.year);
    if (req.query.placementReady === 'true') filter.placementReady = true;

    const students = await User.find(filter).sort({ totalScore: -1 })
      .select('name rollNumber department year section totalScore cgpa attendance placementReady email phone');

    const data   = students.map((s, i) => ({ rank: i + 1, ...s.toObject() }));
    const fields = [
      { label: 'Rank',            value: 'rank' },
      { label: 'Name',            value: 'name' },
      { label: 'Roll Number',     value: 'rollNumber' },
      { label: 'Department',      value: 'department' },
      { label: 'Year',            value: 'year' },
      { label: 'Section',         value: 'section' },
      { label: 'Total Score',     value: 'totalScore' },
      { label: 'CGPA',            value: 'cgpa' },
      { label: 'Attendance (%)',  value: 'attendance' },
      { label: 'Placement Ready', value: 'placementReady' },
      { label: 'Email',           value: 'email' },
      { label: 'Phone',           value: 'phone' },
    ];
    const parser = new Parser({ fields });
    const csv    = parser.parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leaderboard.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
