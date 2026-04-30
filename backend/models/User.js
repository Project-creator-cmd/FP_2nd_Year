const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'faculty', 'admin', 'placement', 'dept_head', 'event_organizer'], required: true },
  department: { type: String, required: true },
  rollNumber: { type: String, sparse: true },
  year: { type: Number, min: 1, max: 4 },
  section: { type: String },
  phone: { type: String },
  avatar: { type: String },
  designation: { type: String, trim: true }, // for faculty / dept_head
  isActive: { type: Boolean, default: true },
  totalScore: { type: Number, default: 0 },
  placementReady: { type: Boolean, default: false },
  attendance: { type: Number, default: 75 },
  cgpa: { type: Number, default: 0, min: 0, max: 10 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = mongoose.model('User', userSchema);
