const Notification = require('../models/Notification');

/**
 * Create an in-app notification for a user.
 * Non-blocking — errors are logged but never thrown to callers.
 */
async function notify(userId, message, type = 'general', meta = {}) {
  try {
    await Notification.create({ userId, message, type, meta });
  } catch (err) {
    console.error('[notify] Failed to create notification:', err.message);
  }
}

/**
 * Notify all students in a department about a new event.
 */
async function notifyDepartment(User, department, message, type = 'new_event', meta = {}) {
  try {
    const students = await User.find({ role: 'student', department, isActive: true }).select('_id');
    if (!students.length) return;
    const docs = students.map(s => ({ userId: s._id, message, type, meta }));
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error('[notifyDepartment] Failed:', err.message);
  }
}

module.exports = { notify, notifyDepartment };
