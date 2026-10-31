
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require(
  "google-auth-library"
);

const User = require("../models/User");

const RefreshSession = require(
  "../models/RefreshSession"
);

const {
  createRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
  getRefreshToken,
  clearRefreshCookie,
  generateAccessToken,
  ACCESS_TOKEN_EXPIRY_SECONDS,
} = require(
  "../services/refreshSessionService"
);

const googleClient = new OAuth2Client();

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

const buildAuthResponse = (
  user,
  sessionData
) => ({
  ...sessionData,
  user: getPublicUser(user),
});

// ============================================
// Register with email and password
// ============================================

const register = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and password are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 80
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain between 2 and 80 characters",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !EMAIL_REGEX.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid email address",
      });
    }

    const passwordBytes =
      Buffer.byteLength(
        password,
        "utf8"
      );

    if (
      passwordBytes < 8 ||
      passwordBytes > 72
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain between 8 and 72 UTF-8 bytes",
      });
    }

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Email is already registered",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      authProvider: "local",
    });

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully",
      data: getPublicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Email is already registered",
      });
    }

    next(error);
  }
};

// ============================================
// Login with email and password
// ============================================

const login = async (
  req,
  res,
  next
) => {
  try {
    const { email, password } =
      req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    if (
      !user ||
      user.authProvider === "google" ||
      typeof user.passwordHash !== "string"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const sessionData =
      await createRefreshSession(
        user,
        res
      );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: buildAuthResponse(
        user,
        sessionData
      ),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Google Login / Signup
// ============================================

const googleLogin = async (
  req,
  res,
  next
) => {
  try {
    const { credential } =
      req.body || {};

    if (
      typeof credential !== "string" ||
      !credential.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid Google credential is required",
      });
    }

    const clientId =
      process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new Error(
        "GOOGLE_CLIENT_ID is not configured"
      );
    }

    let payload;

    try {
      const ticket =
        await googleClient.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });

      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Google credential",
      });
    }

    if (
      !payload?.sub ||
      typeof payload.email !== "string" ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Google account verification failed",
      });
    }

    const googleId = payload.sub;

    const email =
      payload.email.trim().toLowerCase();

    if (
      email.length > 254 ||
      !EMAIL_REGEX.test(email)
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid Google account email",
      });
    }

    let user = await User.findOne({
      googleId,
    });

    if (!user) {
      const existingEmailUser =
        await User.findOne({ email });

      if (existingEmailUser) {
        return res.status(409).json({
          success: false,
          message:
            "This email is already registered using another sign-in method",
        });
      }

      const suggestedName =
        typeof payload.name === "string"
          ? payload.name.trim()
          : "";

      const fallbackName =
        email.split("@")[0];

      const name = (
        suggestedName.length >= 2
          ? suggestedName
          : fallbackName.length >= 2
            ? fallbackName
            : "Google User"
      ).slice(0, 80);

      user = await User.create({
        name,
        email,
        authProvider: "google",
        googleId,
      });
    }

    const sessionData =
      await createRefreshSession(
        user,
        res
      );

    return res.status(200).json({
      success: true,
      message:
        "Google login successful",
      data: buildAuthResponse(
        user,
        sessionData
      ),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Account creation conflict. Please try signing in again.",
      });
    }

    next(error);
  }
};

// ============================================
// Refresh access token
// ============================================

const refreshAccessToken = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken =
      getRefreshToken(req);

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message:
          "Refresh session required",
      });
    }

    const session =
      await rotateRefreshSession(
        refreshToken,
        res
      );

    if (!session) {
      clearRefreshCookie(res);

      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired refresh session",
      });
    }

    const user = await User.findById(
      session.user
    );

    if (!user) {
      await RefreshSession.updateOne(
        { _id: session._id },
        {
          $set: {
            revokedAt: new Date(),
          },
        }
      );

      clearRefreshCookie(res);

      return res.status(401).json({
        success: false,
        message:
          "User no longer exists",
      });
    }

    const accessToken =
      generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message:
        "Access token refreshed",
      data: buildAuthResponse(
        user,
        {
          token: accessToken,
          tokenType: "Bearer",
          expiresIn:
            ACCESS_TOKEN_EXPIRY_SECONDS,
        }
      ),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Logout and revoke refresh session
// ============================================

const logout = async (
  req,
  res,
  next
) => {
  try {
    const refreshToken =
      getRefreshToken(req);

    if (refreshToken) {
      await revokeRefreshSession(
        refreshToken
      );
    }

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Current authenticated user
// ============================================

const getCurrentUser = async (
  req,
  res,
  next
) => {
  try {
    return res.status(200).json({
      success: true,
      data: getPublicUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
