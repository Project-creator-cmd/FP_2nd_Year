const mongoose = require('mongoose');

const scoringRuleSchema = new mongoose.Schema({
  department: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  position: { type: String, required: true },
  points: { type: Number, required: true, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

scoringRuleSchema.index({ department: 1, category: 1, level: 1, position: 1 }, { unique: true });

module.exports = mongoose.model('ScoringRule', scoringRuleSchema);
