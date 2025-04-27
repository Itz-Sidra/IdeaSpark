const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/auth.routes'); // Import auth routes
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Enable CORS for all origins (or you can specify specific origins if needed)
app.use(cors());

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Use authentication routes
app.use('/api/auth', authRoutes);

const port = process.env.PORT || 5000; // Use PORT from .env or fallback to 5000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('DATABASE_URL:', process.env.DATABASE_URL); // Debugging line
});
