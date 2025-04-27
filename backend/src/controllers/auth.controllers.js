const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

// Signup logic
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully!',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Server error during signup" });
  }
};

// Login logic
const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`Login attempt for email: ${email}`);
  
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`User found: ${user.id}`);
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password valid: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log(`Login successful for: ${email}`);
    
    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { signup, login };