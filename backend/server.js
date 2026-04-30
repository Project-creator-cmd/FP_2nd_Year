const express      = require('express');
const mongoose     = require('mongoose');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize'); // NoSQL injection protection
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes          = require('./routes/auth');
const userRoutes          = require('./routes/users');
const achievementRoutes   = require('./routes/achievements');
const scoringRoutes       = require('./routes/scoring');
const relaxationRoutes    = require('./routes/relaxation');
const analyticsRoutes     = require('./routes/analytics');
const leaderboardRoutes   = require('./routes/leaderboard');
const placementRoutes     = require('./routes/placement');
const eventRoutes         = require('./routes/events');
const notificationRoutes  = require('./routes/notifications');

const app = express();

// Security headers
app.use(helmet());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter rate limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // required for HTTP-only cookies
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // parse HTTP-only refresh token cookie

// Sanitize request data against NoSQL injection (removes $ and . from keys)
app.use(mongoSanitize());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/achievements',  achievementRoutes);
app.use('/api/scoring',       scoringRoutes);
app.use('/api/relaxation',    relaxationRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/leaderboard',   leaderboardRoutes);
app.use('/api/placement',     placementRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Acadex server running on port ${PORT}`));
