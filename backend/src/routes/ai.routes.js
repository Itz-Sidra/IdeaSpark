const express = require('express');
const router = express.Router();
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST route to generate a project idea
router.post('/generate-idea', async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || input.trim() === "") {
      return res.status(400).json({ error: "Input is required" });
    }

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

    const prompt = `Generate a unique and creative tech project idea based on this input: "${input}". 
    Include details such as the domain, technologies involved, and potential real-world use case.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ idea: text });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({ error: "Failed to generate idea" });
  }
});

module.exports = router;
