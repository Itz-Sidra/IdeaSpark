const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
require('dotenv').config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.body) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// CORS setup
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parsing with increased limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'IdeaSpark API Server',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/health - Health check',
      'GET /api/ai/health - AI service health',
      'POST /api/ai/generate-ideas - Generate project ideas',
      'POST /api/ai/generate-idea - Generate single idea (legacy)',
      'POST /api/auth/* - Authentication routes'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Connection successful!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET /',
      'GET /api/health',
      'GET /api/test',
      'GET /api/ai/health',
      'POST /api/ai/generate-ideas',
      'POST /api/ai/generate-idea'
    ],
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 5000;

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const server = app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════╗
║         IdeaSpark API Server           ║
║                                        ║
║  🚀 Server running on port ${port}         ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}                ║
║  📝 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}     ║
║  ⏰ Started: ${new Date().toLocaleString()}        ║
║                                        ║
║  Available endpoints:                  ║
║  • GET  /                              ║
║  • GET  /api/health                    ║
║  • GET  /api/ai/health                 ║
║  • POST /api/ai/generate-ideas         ║
║  • POST /api/ai/generate-idea          ║
║                                        ║
╚════════════════════════════════════════╝
  `);
  
  // Check if Gemini API key is configured
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  WARNING: GEMINI_API_KEY is not configured in environment variables');
  }
});

module.exports = app;