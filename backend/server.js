const express       = require('express');
const mongoose      = require('mongoose');
const cors          = require('cors');
const dotenv        = require('dotenv');
const path          = require('path');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');
const helmet        = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss           = require('xss-clean');
const hpp           = require('hpp');
const compression   = require('compression');
const cookieParser  = require('cookie-parser');
const logger        = require('./utils/logger');
const { csrfProtect } = require('./middleware/csrf');
const { scheduleJob } = require('./utils/scheduler');

dotenv.config();

// ── Env validation ────────────────────────────────────────────────
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
  logger.error('Missing required env vars', { missing });
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  logger.error('JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

const app    = express();
const isProd = process.env.NODE_ENV === 'production';

// ── Security headers (CSP fixed — no duplicate keys) ─────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      // Razorpay checkout script + self
      scriptSrc:   ["'self'", 'https://checkout.razorpay.com'],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", 'data:', 'https://res.cloudinary.com'],
      // Allow API calls to Razorpay
      connectSrc:  ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
      // Allow Razorpay iframe for payment popup
      frameSrc:    ["'self'", 'https://api.razorpay.com'],
      fontSrc:     ["'self'", 'https://fonts.gstatic.com'],
      objectSrc:   ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ── Compression ───────────────────────────────────────────────────
app.use(compression());

// ── Cookie parser (must be before CSRF) ──────────────────────────
app.use(cookieParser());

// ── HTTP logging via Winston ──────────────────────────────────────
app.use(morgan(isProd ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── CORS ──────────────────────────────────────────────────────────
// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://pakka-famous.vercel.app'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(
    ...process.env.FRONTEND_URL
      .split(',')
      .map(url => url.trim())
      .filter(Boolean)
  );
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('Blocked Origin:', origin);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

app.options('*', cors());
// ── Body parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Data sanitisation ─────────────────────────────────────────────
app.use(mongoSanitize());   // strip $-prefixed keys (NoSQL injection)
app.use(xss());             // strip HTML from inputs
app.use(hpp());             // prevent HTTP parameter pollution

// ── Rate limiting ─────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please wait.'
  },
  skip: req => req.method === 'OPTIONS',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 15 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes.'
  },
});
// ── CSRF protection ───────────────────────────────────────────────
// TEMPORARILY DISABLED FOR VERCEL + RENDER DEPLOYMENT
// Enable later after frontend sends CSRF token correctly

if (process.env.ENABLE_CSRF === 'true') {
  app.use(csrfProtect);
}

// ── Database ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    logger.info('MongoDB connected');
    await scheduleJob();
  })
  .catch(err => {
    logger.error('MongoDB connection failed', {
      error: err.message
    });
    process.exit(1);
  });
// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',              authLimiter);
app.use('/api',                   apiLimiter);

app.use('/api/auth',              require('./routes/authRoutes'));
app.use('/api/products',          require('./routes/productRoutes'));
app.use('/api/cart',              require('./routes/cartRoutes'));
app.use('/api/orders',            require('./routes/orderRoutes'));
app.use('/api/payments',          require('./routes/paymentRoutes'));
app.use('/api/admin',             require('./routes/adminRoutes'));
app.use('/api/users',             require('./routes/userRoutes'));
app.use('/api/coupons',           require('./routes/couponRoutes'));
app.use('/api/content',           require('./routes/contentRoutes'));
app.use('/api/city-sweets',       require('./routes/citySweetRoutes'));
app.use('/api/wishlist',          require('./routes/wishlistRoutes'));
app.use('/api/stories',           require('./routes/storyRoutes'));
app.use('/api/seasonal-specials', require('./routes/seasonalRoutes'));
app.use('/api/special-offers',    require('./routes/specialOfferRoutes'));
app.use('/api/occasions',         require('./routes/occasionRoutes'));
app.use('/api/packings',          require('./routes/packingRoutes'));
app.use('/api/testimonials',      require('./routes/testimonialRoutes'));
app.use('/api/specials',          require('./routes/specialsRoutes'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', uptime: process.uptime(), env: process.env.NODE_ENV })
);

// ── Serve React build (production) ───────────────────────────────
if (isProd) {
  const buildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(buildPath, {
    setHeaders: (res, filePath) => {
      res.setHeader(
        'Cache-Control',
        filePath.endsWith('.html') ? 'no-cache, no-store, must-revalidate' : 'public, max-age=31536000, immutable'
      );
    },
  }));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Request error', {
    method: req.method,
    url:    req.originalUrl,
    error:  err.message,
    stack:  isProd ? undefined : err.stack,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map(e => e.message).join(', '),
    });
  }
  if (err.name === 'CastError')
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ success: false, message: 'Invalid token' });
  if (err.name === 'TokenExpiredError')
    return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ success: false, message: 'File too large. Max 5MB.' });
  if (err.message?.includes('CORS'))
    return res.status(403).json({ success: false, message: 'Not allowed by CORS' });

  res.status(err.status || 500).json({
    success: false,
    message: isProd ? 'Something went wrong. Please try again.' : err.message,
  });
});

// ── Start server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  logger.info(`Server started on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);

module.exports = app;

