
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const aiRoutes = require("./routes/aiRoutes");
const verifyAuth = require("./middleware/verifyAuth");

const app = express();

// ==========================================
// Allowed Frontend Origins
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-notes-manager-jade.vercel.app",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// ==========================================
// Security Headers
// ==========================================

app.use(helmet());

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin(origin, callback) {
      console.log("Origin:", origin);

      // Allow non-browser requests
      // Authentication will still be required
      // for protected routes.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked:", origin);

      return callback(new Error("CORS blocked"));
    },

    methods: ["GET", "POST", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// ==========================================
// JSON Body Parser
// ==========================================

app.use(
  express.json({
    limit: "100kb",
  })
);

// ==========================================
// Health Check
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 AI Notes Manager Backend Running",
  });
});

// ==========================================
// AI Rate Limiter
// ==========================================
//
// This is an IP-based backstop.
// The actual monthly user limit
// will be enforced by Firebase UID
// inside the controller.
//

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
  },
});

// ==========================================
// Protected AI Route
// ==========================================
//
// Request flow:
//
// Frontend
//    ↓
// Firebase ID Token
//    ↓
// Rate Limiter
//    ↓
// verifyAuth
//    ↓
// AI Controller
//    ↓
// Gemini
//

app.use(
  "/api/ai",
  aiLimiter,
  verifyAuth,
  aiRoutes
);

// ==========================================
// Global Error Handler
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status === 429
        ? "Too many requests. Please try again later."
        : "Internal server error.",
  });
});

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 AI Notes Manager Backend");
  console.log("=================================");
  console.log("Server running on port:", PORT);
  console.log("Allowed Origins:", allowedOrigins);
  console.log("AI rate limit: 10 requests/min/IP");
});

