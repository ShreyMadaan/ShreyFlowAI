
const express = require("express");

const rateLimit = require(
  "express-rate-limit"
);

const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/authController");

const requireAuth = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

router.post(
  "/register",
  authLimiter,
  register
);

router.post(
  "/login",
  authLimiter,
  login
);

router.get(
  "/me",
  requireAuth,
  getCurrentUser
);

module.exports = router;
