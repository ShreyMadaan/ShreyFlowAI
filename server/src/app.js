
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
      // Requests without an Origin header can
      // come from scripts or API testing tools.
      // Cookie-based endpoints will get their
      // own stricter CSRF origin validation.
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          "Not allowed by CORS"
        )
      );
    },

    // Required for refresh-token cookies.
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

// Parse cookies from incoming requests.
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

// Protected, user-owned task routes
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
