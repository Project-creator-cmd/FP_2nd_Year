const User        = require('../models/User');
const Achievement = require('../models/Achievement');
const { Parser }  = require('json2csv');

/* ── helpers ─────────────────────────────────────────────────── */

async function buildPlacementList(filter) {
  const students = await User.find(filter)
    .sort({ totalScore: -1 })
    .select('name rollNumber department year section totalScore cgpa attendance phone email placementReady');

  return Promise.all(students.map(async s => {
    const achievementCount = await Achievement.countDocuments({ userId: s._id, status: 'verified' });
    return { ...s.toObject(), achievementCount };
  }));
}

/* ── controllers ─────────────────────────────────────────────── */

exports.getPlacementReady = async (req, res) => {
  try {
    const filter = { role: 'student', placementReady: true };
    if (req.query.department) filter.department = req.query.department;
    if (req.query.year)       filter.year       = parseInt(req.query.year);

    // Pagination
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;

    const total    = await User.countDocuments(filter);
    const students = await User.find(filter)
      .sort({ totalScore: -1 })
      .skip(skip)
      .limit(limit)
      .select('name rollNumber department year section totalScore cgpa attendance phone email');

    const enriched = await Promise.all(students.map(async s => {
      const achievementCount = await Achievement.countDocuments({ userId: s._id, status: 'verified' });
      return { ...s.toObject(), achievementCount };
    }));

    res.json({ success: true, data: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const achievements = await Achievement.find({ userId: student._id, status: 'verified' }).sort({ score: -1 });
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

// GET /placement/export — CSV download of all placement-ready students
exports.exportPlacement = async (req, res) => {
  try {
    const filter = { role: 'student', placementReady: true };
    if (req.query.department) filter.department = req.query.department;
    if (req.query.year)       filter.year       = parseInt(req.query.year);

    const enriched = await buildPlacementList(filter);
    const fields = [
      { label: 'Name',              value: 'name' },
      { label: 'Roll Number',       value: 'rollNumber' },
      { label: 'Department',        value: 'department' },
      { label: 'Year',              value: 'year' },
      { label: 'Section',           value: 'section' },
      { label: 'Total Score',       value: 'totalScore' },
      { label: 'CGPA (Self-Reported)', value: 'cgpa' },
      { label: 'Attendance (%)',    value: 'attendance' },
      { label: 'Achievements',      value: 'achievementCount' },
      { label: 'Email',             value: 'email' },
      { label: 'Phone',             value: 'phone' },
    ];
    const parser = new Parser({ fields });
    const csv    = parser.parse(enriched);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="placement_ready.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
