
const express = require("express");
const cors = require("cors");

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

const allowedOrigin =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

// CORS
app.use(
  cors({
    origin: allowedOrigin,
  })
);

// JSON body parser
app.use(
  express.json({
    limit: "1mb",
  })
);

// API routes
app.use("/api/health", healthRoutes);

// Authentication endpoints
app.use("/api/auth", authRoutes);

// Task endpoints
// TODO Milestone 4.3:
// Protect routes and scope tasks by owner.
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
