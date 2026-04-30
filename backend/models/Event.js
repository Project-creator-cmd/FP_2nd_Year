const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, trim: true },
  category: {
    type: String,
    enum: ['academic', 'technical', 'sports', 'cultural', 'internship', 'certification', 'research', 'other'],
    required: true,
  },
  level: {
    type: String,
    enum: ['international', 'national', 'state', 'university', 'college', 'department'],
    required: true,
  },
  // Replaced single eventDate with startDate + endDate
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  organizingBody: { type: String, trim: true },
  organizer:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department:   { type: String, required: true },
  // Participant list file (PDF / xlsx / csv) stored on Cloudinary as raw
  participantListUrl:      { type: String },
  participantListPublicId: { type: String },
  // Status is computed from dates — stored for query efficiency
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  // Parsed roll numbers extracted from the participant file for auto-matching
  parsedParticipants: [{ type: String }],
}, { timestamps: true });

// Auto-compute status before every save based on endDate vs today
eventSchema.pre('save', function (next) {
  const now = new Date();
  this.status = this.endDate && now > this.endDate ? 'closed' : 'active';
  next();
});

eventSchema.index({ department: 1, startDate: -1 });
eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema);
