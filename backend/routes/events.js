const express = require('express');
const router  = express.Router();
const {
  createEvent, getMyEvents, getDepartmentEvents,
  getAllEvents, getEventById, deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { uploadRaw } = require('../config/cloudinary');

// Organizer uploads an event with optional participant list file
router.post(
  '/',
  protect,
  authorize('event_organizer'),
  uploadRaw.single('participantList'),   // field name matches frontend FormData key
  createEvent
);

// Organizer views their own events
router.get('/mine',       protect, authorize('event_organizer'), getMyEvents);

// Faculty / dept_head / admin — department-scoped event list with achievement cross-ref
router.get('/department', protect, authorize('faculty', 'admin', 'dept_head'), getDepartmentEvents);

// General list (organizer can also see their dept events here)
router.get('/',           protect, authorize('faculty', 'admin', 'dept_head', 'event_organizer'), getAllEvents);

// Single event detail
router.get('/:id',        protect, authorize('faculty', 'admin', 'dept_head', 'event_organizer'), getEventById);

// Delete
router.delete('/:id',     protect, authorize('event_organizer', 'admin'), deleteEvent);

module.exports = router;
