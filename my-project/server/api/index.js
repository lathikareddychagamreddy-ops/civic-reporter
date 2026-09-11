// Vercel Serverless Handler
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Set database path before importing db module
if (process.env.NODE_ENV === 'production') {
  process.env.DATABASE_PATH = '/tmp/civic_pulse.db';
}

const { initDB } = require('../src/db');
const reportsRoutes = require('../src/routes/reports');
const analyticsRoutes = require('../src/routes/analytics');

const app = express();

// CORS Configuration - Allow both localhost (dev) and Vercel (production)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL || 'https://civic-reporter.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory - use /tmp for Vercel serverless
const uploadsDir = process.env.NODE_ENV === 'production' 
  ? path.resolve('/tmp', 'uploads')
  : path.resolve(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CivicPulse backend is live' });
});

// Initialize DB and export the app
initDB().catch(err => {
  console.error('Failed to initialize DB:', err);
});

module.exports = app;
