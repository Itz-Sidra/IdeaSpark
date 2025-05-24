const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
require('dotenv').config();

const app = express();

// CORS setup
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parsing
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Connection successful!' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
