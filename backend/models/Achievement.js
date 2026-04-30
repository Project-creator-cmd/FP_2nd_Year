const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userRole: { type: String, enum: ['student', 'faculty'], required: true },
  department: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['academic', 'technical', 'sports', 'cultural', 'internship', 'certification', 'research', 'other'],
    required: true
  },
  level: { type: String, enum: ['international', 'national', 'state', 'university', 'college', 'department'], required: true },
  position: { type: String, enum: ['1st', '2nd', '3rd', 'participant', 'winner', 'runner-up', 'completed', 'published'], default: 'participant' },
  date: { type: Date, required: true },
  organizingBody: { type: String, trim: true },
  certificateUrl: { type: String },
  certificatePublicId: { type: String },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  rejectionReason: { type: String },
  score: { type: Number, default: 0 },
  remarks: { type: String },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  verifiedByRole: { type: String, enum: ['faculty', 'dept_head', 'admin'], default: null },
  // auto-matched = roll number found in event participant list; manual-review = not found
  matchStatus: { type: String, enum: ['auto-matched', 'manual-review', null], default: null }
}, { timestamps: true });

achievementSchema.index({ userId: 1, status: 1 });
achievementSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
