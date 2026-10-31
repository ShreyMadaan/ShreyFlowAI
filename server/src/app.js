
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const healthRoutes = require(
  "./routes/healthRoutes"
);

const taskRoutes = require(
  "./routes/taskRoutes"
);

const authRoutes = require(
  "./routes/authRoutes"
);

const notFound = require(
  "./middleware/notFound"
);

const errorHandler = require(
  "./middleware/errorHandler"
);

const app = express();

// ============================================
// Reverse Proxy Configuration
// ============================================

// Render runs the Express application
// behind a reverse proxy.
//
// Trust one proxy hop so Express and
// express-rate-limit can use forwarded
// client IP information.
//
// Do not enable unrestricted trust proxy.

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ============================================
// CORS Configuration
// ============================================

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser requests may omit Origin.
      // Authentication mutations have their
      // own origin validation middleware.

      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PATCH",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
  })
);

// ============================================
// Request Parsers
// ============================================

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(cookieParser());

// ============================================
// API Routes
// ============================================

// Health check
app.use(
  "/api/health",
  healthRoutes
);

// Authentication
app.use(
  "/api/auth",
  authRoutes
);

// Protected task routes
app.use(
  "/api/tasks",
  taskRoutes
);

// ============================================
// Error Handling
// ============================================

app.use(notFound);

app.use(errorHandler);

module.exports = app;
