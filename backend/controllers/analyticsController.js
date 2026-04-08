const Achievement = require('../models/Achievement');
const User = require('../models/User');
const AttendanceRelaxation = require('../models/AttendanceRelaxation');

exports.getDepartmentAnalytics = async (req, res) => {
  try {
    const dept = req.user.role === 'admin' && req.query.department ? req.query.department : req.user.department;

    const [totalStudents, totalAchievements, verifiedAchievements, pendingAchievements, placementReady] = await Promise.all([
      User.countDocuments({ role: 'student', department: dept }),
      Achievement.countDocuments({ department: dept }),
      Achievement.countDocuments({ department: dept, status: 'verified' }),
      Achievement.countDocuments({ department: dept, status: 'pending' }),
      User.countDocuments({ role: 'student', department: dept, placementReady: true })
    ]);

    const byCategory = await Achievement.aggregate([
      { $match: { department: dept, status: 'verified' } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalScore: { $sum: '$score' } } },
      { $sort: { count: -1 } }
    ]);

    const byLevel = await Achievement.aggregate([
      { $match: { department: dept, status: 'verified' } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byMonth = await Achievement.aggregate([
      { $match: { department: dept, status: 'verified', date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topStudents = await User.find({ role: 'student', department: dept })
      .sort({ totalScore: -1 }).limit(5).select('name rollNumber totalScore placementReady year');

    const scoreDistribution = await User.aggregate([
      { $match: { role: 'student', department: dept } },
      { $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$totalScore', 25] }, then: '0-24' },
              { case: { $lt: ['$totalScore', 50] }, then: '25-49' },
              { case: { $lt: ['$totalScore', 75] }, then: '50-74' },
              { case: { $lt: ['$totalScore', 100] }, then: '75-99' },
              { case: { $gte: ['$totalScore', 100] }, then: '100+' }
            ],
            default: 'unknown'
          }
        },
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      success: true,
      data: {
        summary: { totalStudents, totalAchievements, verifiedAchievements, pendingAchievements, placementReady },
        byCategory, byLevel, byMonth, topStudents, scoreDistribution
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdminOverview = async (req, res) => {
  try {
    const departments = await User.distinct('department');
    const stats = await Promise.all(departments.map(async dept => {
      const [students, faculty, achievements, placementReady] = await Promise.all([
        User.countDocuments({ role: 'student', department: dept }),
        User.countDocuments({ role: 'faculty', department: dept }),
        Achievement.countDocuments({ department: dept, status: 'verified' }),
        User.countDocuments({ role: 'student', department: dept, placementReady: true })
      ]);
      return { department: dept, students, faculty, achievements, placementReady };
    }));

    const globalStats = {
      totalUsers: await User.countDocuments(),
      totalStudents: await User.countDocuments({ role: 'student' }),
      totalFaculty: await User.countDocuments({ role: 'faculty' }),
      totalAchievements: await Achievement.countDocuments(),
      verified: await Achievement.countDocuments({ status: 'verified' }),
      pending: await Achievement.countDocuments({ status: 'pending' }),
      placementReady: await User.countDocuments({ role: 'student', placementReady: true }),
      pendingRelaxations: await AttendanceRelaxation.countDocuments({ status: 'pending_admin' })
    };

    res.json({ success: true, data: { globalStats, departmentStats: stats } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
