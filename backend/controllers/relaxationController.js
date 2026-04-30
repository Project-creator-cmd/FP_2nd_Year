const AttendanceRelaxation = require('../models/AttendanceRelaxation');
const User = require('../models/User');
const { notify } = require('../utils/notify');
const { sendEmail } = require('../utils/email');

exports.create = async (req, res) => {
  try {
    const { achievement, requestedRelaxation, reason } = req.body;
    const user = await User.findById(req.user.id);
    const existing = await AttendanceRelaxation.findOne({ student: req.user.id, achievement, status: { $in: ['pending_faculty', 'pending_admin'] } });
    if (existing) return res.status(400).json({ success: false, message: 'Request already pending' });
    const relaxation = await AttendanceRelaxation.create({
      student: req.user.id,
      achievement,
      department: user.department,
      requestedRelaxation,
      currentAttendance: user.attendance,
      reason
    });
    res.status(201).json({ success: true, relaxation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await AttendanceRelaxation.find({ student: req.user.id })
      .populate('achievement', 'title category level')
      .populate('facultyRecommendedBy', 'name')
      .populate('adminApprovedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDepartmentRequests = async (req, res) => {
  try {
    const filter = { department: req.user.department };
    if (req.query.status) filter.status = req.query.status;
    const requests = await AttendanceRelaxation.find(filter)
      .populate('student', 'name rollNumber year section')
      .populate('achievement', 'title category level')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.facultyAction = async (req, res) => {
  try {
    const { action, remarks } = req.body;
    const relaxation = await AttendanceRelaxation.findById(req.params.id);
    if (!relaxation) return res.status(404).json({ success: false, message: 'Not found' });
    if (relaxation.department !== req.user.department) return res.status(403).json({ success: false, message: 'Access denied' });
    if (relaxation.status !== 'pending_faculty') return res.status(400).json({ success: false, message: 'Invalid state' });
    if (action === 'recommend') {
      relaxation.status = 'pending_admin';
      relaxation.facultyRecommendedBy = req.user.id;
      relaxation.facultyRecommendedAt = new Date();
      relaxation.facultyRemarks = remarks;
    } else {
      relaxation.status = 'rejected';
      relaxation.facultyRemarks = remarks;
    }
    await relaxation.save();
    res.json({ success: true, relaxation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminAction = async (req, res) => {
  try {
    const { action, grantedRelaxation, remarks } = req.body;
    const relaxation = await AttendanceRelaxation.findById(req.params.id)
      .populate('student', 'name email department');
    if (!relaxation) return res.status(404).json({ success: false, message: 'Not found' });
    if (relaxation.status !== 'pending_admin') return res.status(400).json({ success: false, message: 'Invalid state' });
    if (req.user.role === 'dept_head' && relaxation.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Cross-department access denied' });
    }

    if (action === 'approve') {
      relaxation.status            = 'approved';
      relaxation.grantedRelaxation = grantedRelaxation || relaxation.requestedRelaxation;
      relaxation.adminApprovedBy   = req.user.id;
      relaxation.adminApprovedAt   = new Date();
      relaxation.adminRemarks      = remarks;
      await User.findByIdAndUpdate(relaxation.student._id, {
        $inc: { attendance: relaxation.grantedRelaxation }
      });
      await notify(
        relaxation.student._id,
        `Your attendance relaxation request has been approved. ${relaxation.grantedRelaxation}% relaxation granted.`,
        'relaxation_approved'
      );
      await sendEmail(
        relaxation.student.email,
        'Attendance Relaxation Approved - Acadex',
        `<p>Hi ${relaxation.student.name},</p>
         <p>Your attendance relaxation request has been <strong>approved</strong>.</p>
         <p>Relaxation granted: <strong>${relaxation.grantedRelaxation}%</strong></p>
         ${remarks ? `<p>Remarks: ${remarks}</p>` : ''}`
      );
    } else {
      relaxation.status          = 'rejected';
      relaxation.adminRemarks    = remarks;
      relaxation.adminApprovedBy = req.user.id;
      relaxation.adminApprovedAt = new Date();
      await notify(
        relaxation.student._id,
        `Your attendance relaxation request has been rejected.${remarks ? ' Reason: ' + remarks : ''}`,
        'relaxation_rejected'
      );
      await sendEmail(
        relaxation.student.email,
        'Attendance Relaxation Update - Acadex',
        `<p>Hi ${relaxation.student.name},</p>
         <p>Your attendance relaxation request was <strong>not approved</strong>.</p>
         ${remarks ? `<p>Reason: ${remarks}</p>` : ''}`
      );
    }
    await relaxation.save();
    res.json({ success: true, relaxation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
