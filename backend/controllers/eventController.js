const Event  = require('../models/Event');
const User   = require('../models/User');
const Achievement = require('../models/Achievement');
const { cloudinary } = require('../config/cloudinary');
const { notifyDepartment } = require('../utils/notify');
const XLSX   = require('xlsx');

/* ── helpers ─────────────────────────────────────────────────── */

/**
 * Download a Cloudinary raw file and parse it as Excel/CSV.
 * Returns an array of identifiers (roll numbers / names) from column A.
 */
async function parseParticipantFile(fileUrl) {
  const https  = require('https');
  const http   = require('http');
  const { URL } = require('url');

  return new Promise((resolve) => {
    try {
      const parsed = new URL(fileUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      const chunks = [];
      client.get(fileUrl, (res) => {
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          try {
            const buf  = Buffer.concat(chunks);
            const wb   = XLSX.read(buf, { type: 'buffer' });
            const ws   = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
            const ids  = rows.slice(1)
              .map(r => String(r[0] || '').trim())
              .filter(Boolean);
            resolve(ids);
          } catch { resolve([]); }
        });
        res.on('error', () => resolve([]));
      }).on('error', () => resolve([]));
    } catch { resolve([]); }
  });
}

/** Recompute status based on endDate */
function computeStatus(endDate) {
  return endDate && new Date() > new Date(endDate) ? 'closed' : 'active';
}

/* ── POST /api/events ────────────────────────────────────────── */

exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, level, startDate, endDate, organizingBody, department } = req.body;

    if (!title || !category || !level || !startDate || !endDate || !department) {
      return res.status(400).json({
        success: false,
        message: 'title, category, level, startDate, endDate and department are required',
      });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ success: false, message: 'End Date cannot be earlier than Start Date' });
    }

    const eventData = {
      title, description, category, level,
      startDate: start,
      endDate:   end,
      organizingBody,
      department,
      organizer: req.user.id,
      status:    computeStatus(end),
    };

    if (req.file) {
      eventData.participantListUrl      = req.file.path;
      eventData.participantListPublicId = req.file.filename;
    }

    const event = await Event.create(eventData);
    await event.populate('organizer', 'name department');

    // Notify all students in the department
    await notifyDepartment(
      User,
      department,
      `New event posted: "${title}" (${category} - ${level}). Check the events section for details.`,
      'new_event',
      { eventId: event._id }
    );

    // Parse participant file asynchronously (non-blocking)
    if (req.file?.path) {
      parseParticipantFile(req.file.path)
        .then(async (ids) => {
          if (ids.length) {
            await Event.findByIdAndUpdate(event._id, { parsedParticipants: ids });
          }
        })
        .catch(() => {});
    }

    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/events/mine ────────────────────────────────────── */

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .populate('organizer', 'name department')
      .sort({ startDate: -1 });

    // Refresh status based on current date before returning
    const now = new Date();
    const updated = events.map(e => {
      const obj = e.toObject();
      obj.status = now > new Date(e.endDate) ? 'closed' : 'active';
      return obj;
    });

    res.json({ success: true, events: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/events/department ──────────────────────────────── */
// Faculty, dept_head, admin — events for their department

exports.getDepartmentEvents = async (req, res) => {
  try {
    const dept = req.user.role === 'admin' && req.query.department
      ? req.query.department
      : req.user.department;

    const now    = new Date();
    const events = await Event.find({ department: dept })
      .populate('organizer', 'name department')
      .sort({ startDate: -1 });

    // Enrich with live status + achievement cross-reference count
    const enriched = await Promise.all(events.map(async (e) => {
      const obj    = e.toObject();
      obj.status   = now > new Date(e.endDate) ? 'closed' : 'active';

      // Count achievements that reference this event's organizing body or title
      const achCount = await Achievement.countDocuments({
        department: dept,
        $or: [
          { organizingBody: { $regex: e.organizingBody || e.title, $options: 'i' } },
          { eventId: e._id },
        ],
      });
      obj.linkedAchievements = achCount;
      return obj;
    }));

    res.json({ success: true, events: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/events ─────────────────────────────────────────── */
// General list — scoped by department for non-admin

exports.getAllEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'admin') {
      if (req.query.department) filter.department = req.query.department;
    } else {
      filter.department = req.user.department;
    }
    if (req.query.status) filter.status = req.query.status;

    const now    = new Date();
    const events = await Event.find(filter)
      .populate('organizer', 'name department')
      .sort({ startDate: -1 });

    const updated = events.map(e => {
      const obj  = e.toObject();
      obj.status = now > new Date(e.endDate) ? 'closed' : 'active';
      return obj;
    });

    res.json({ success: true, events: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/events/:id ─────────────────────────────────────── */

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name department');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const isOwner   = event.organizer._id.toString() === req.user.id;
    const isSameDept = event.department === req.user.department;
    if (!isOwner && req.user.role !== 'admin' && !isSameDept) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const obj    = event.toObject();
    obj.status   = new Date() > new Date(event.endDate) ? 'closed' : 'active';
    res.json({ success: true, event: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DELETE /api/events/:id ──────────────────────────────────── */

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (event.participantListPublicId) {
      try {
        await cloudinary.uploader.destroy(event.participantListPublicId, { resource_type: 'raw' });
      } catch (_) { /* non-fatal */ }
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
