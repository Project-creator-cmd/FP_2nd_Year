const mongoose = require('mongoose');

// Notification types map to specific events in the system
const notificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message:   { type: String, required: true },
  type:      {
    type: String,
    enum: ['achievement_verified', 'achievement_rejected', 'relaxation_approved',
           'relaxation_rejected', 'new_event', 'general'],
    default: 'general'
  },
  isRead:    { type: Boolean, default: false },
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} }, // extra context (achievementId, etc.)
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
