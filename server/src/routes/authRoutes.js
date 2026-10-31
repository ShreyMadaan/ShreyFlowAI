
const express = require("express");

const rateLimit = require(
  "express-rate-limit"
);

const {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  getCurrentUser,
} = require(
  "../controllers/authController"
);

const requireAuth = require(
  "../middleware/authMiddleware"
);

const validateAuthOrigin = require(
  "../middleware/validateAuthOrigin"
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

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many session requests. Please try again later.",
  },
});

// Protect browser authentication mutations
// against unauthorized cross-origin requests.
router.use(validateAuthOrigin);

// Existing authentication endpoints
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

router.post(
  "/google",
  authLimiter,
  googleLogin
);

// New session endpoints
router.post(
  "/refresh",
  refreshLimiter,
  refreshAccessToken
);

router.post(
  "/logout",
  refreshLimiter,
  logout
);

// JWT-protected current user
router.get(
  "/me",
  requireAuth,
  getCurrentUser
);

module.exports = router;
