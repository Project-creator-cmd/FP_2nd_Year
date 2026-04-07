const express = require('express');
const router = express.Router();
const { getDepartmentLeaderboard, getGlobalLeaderboard, getMyRank } = require('../controllers/leaderboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getDepartmentLeaderboard);
router.get('/global', protect, authorize('admin', 'placement'), getGlobalLeaderboard);
router.get('/my-rank', protect, authorize('student'), getMyRank);

module.exports = router;
