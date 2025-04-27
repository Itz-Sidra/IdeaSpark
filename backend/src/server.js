const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
require('dotenv').config();

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware for parsing JSON requests
app.use(express.json());
// app.use(bodyParser.json());

// Use authentication routes
app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy' });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Connection successful!' });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});