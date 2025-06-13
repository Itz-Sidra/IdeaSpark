const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const ideasRoutes = require("./routes/ideas.routes");

const app = express();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === "POST" && req.body) {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ideas", ideasRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Connection successful!",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.static(path.join(__dirname, "../frontend")));

// Serve HTML pages
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/index.html"))
);
app.get("/about", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/about.html"))
);
app.get("/contact", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/contact.html"))
);
app.get("/generate", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/generate.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/login.html"))
);
app.get("/signup", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/signup.html"))
);
app.get("/profile", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/profile.html"))
);

app.use((err, req, res, next) => {
  console.error("Error occurred:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "GET /",
      "GET /about",
      "GET /contact",
      "GET /generate",
      "GET /login",
      "GET /signup",
      "GET /profile",
      "GET /api/health",
      "GET /api/test",
      "GET /api/ai/health",
      "POST /api/ai/generate-ideas",
      "POST /api/ai/generate-idea",
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "POST /api/ideas/save",
      "GET /api/ideas/my-ideas",
      "DELETE /api/ideas/delete/:ideaId",
    ],
    timestamp: new Date().toISOString(),
  });
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════╗
║         IdeaSpark API Server           ║
║                                        ║
║  Server running on port ${port}         ║
║  Environment: ${process.env.NODE_ENV || "development"}                ║
║  Gemini API: ${process.env.GEMINI_API_KEY ? "Configured" : "Missing"}     ║
║  JWT Secret: ${process.env.JWT_SECRET ? "Configured" : "Missing"}      ║
║  Database: ${process.env.DATABASE_URL ? "Configured" : "Missing"}        ║
║  Started: ${new Date().toLocaleString()}        ║
╚════════════════════════════════════════╝
  `);

  const missingEnvVars = [];
  if (!process.env.GEMINI_API_KEY) missingEnvVars.push("GEMINI_API_KEY");
  if (!process.env.JWT_SECRET) missingEnvVars.push("JWT_SECRET");
  if (!process.env.DATABASE_URL) missingEnvVars.push("DATABASE_URL");

  if (missingEnvVars.length > 0) {
    console.warn("⚠️  WARNING: Missing environment variables:", missingEnvVars.join(", "));
  }
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

module.exports = app;
