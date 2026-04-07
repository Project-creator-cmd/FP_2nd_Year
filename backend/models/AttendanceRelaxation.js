const mongoose = require('mongoose');

const relaxationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', required: true },
  department: { type: String, required: true },
  requestedRelaxation: { type: Number, required: true, min: 1, max: 10 },
  currentAttendance: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending_faculty', 'pending_admin', 'approved', 'rejected'], default: 'pending_faculty' },
  facultyRecommendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facultyRecommendedAt: { type: Date },
  facultyRemarks: { type: String },
  adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminApprovedAt: { type: Date },
  adminRemarks: { type: String },
  grantedRelaxation: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceRelaxation', relaxationSchema);
