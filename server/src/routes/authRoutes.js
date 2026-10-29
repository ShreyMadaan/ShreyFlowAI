
const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  googleLogin,
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

// Email/password registration
router.post(
  "/register",
  authLimiter,
  register
);

// Email/password login
router.post(
  "/login",
  authLimiter,
  login
);

// Google signup/login
router.post(
  "/google",
  authLimiter,
  googleLogin
);

// Current authenticated user
router.get(
  "/me",
  requireAuth,
  getCurrentUser
);

module.exports = router;
