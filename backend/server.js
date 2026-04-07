const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────
// Allow: localhost dev, Vercel preview URLs, the configured FRONTEND_URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,              // e.g. https://speaksmart.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain (preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow chrome extensions
    if (origin.startsWith('chrome-extension://')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── Body Parsers ────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────
app.use('/api/auth',         require('./src/routes/auth'));
app.use('/api/conversation', require('./src/routes/conversation'));
app.use('/api/interview',    require('./src/routes/interview'));
app.use('/api/user',         require('./src/routes/analytics'));
app.use('/api/user',         require('./src/routes/language'));

// Health check — Render pings this to verify the service is up
app.get('/api/health', (req, res) => {
  res.json({
    status: 'SpeakSmart API running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────────
const errorHandler = require('./src/middleware/error');
app.use(errorHandler);

// ─── Database + Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 SpeakSmart Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
