const express = require('express');
const router  = express.Router();
const { getDepartmentLeaderboard, getGlobalLeaderboard, getMyRank, exportLeaderboard } = require('../controllers/leaderboardController');
const { protect, authorize } = require('../middleware/auth');

// Department leaderboard — student, faculty, dept_head can view their own dept
router.get('/',        protect, getDepartmentLeaderboard);

// Global leaderboard — admin and placement officer
router.get('/global',  protect, authorize('admin', 'placement'), getGlobalLeaderboard);

// My rank — student only
router.get('/my-rank', protect, authorize('student'), getMyRank);

// CSV export
router.get('/export',  protect, exportLeaderboard);

module.exports = router;
