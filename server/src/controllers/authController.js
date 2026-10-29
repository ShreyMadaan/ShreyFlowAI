
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  OAuth2Client,
} = require("google-auth-library");

const User = require("../models/User");

const ACCESS_TOKEN_EXPIRY = "15m";
const ACCESS_TOKEN_SECONDS = 900;

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const googleClient = new OAuth2Client();

const getPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider || "local",
});

const generateAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured"
    );
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

const sendLoginResponse = (
  res,
  user,
  message = "Login successful"
) => {
  const token = generateAccessToken(user);

  return res.status(200).json({
    success: true,
    message,
    data: {
      token,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_SECONDS,
      user: getPublicUser(user),
    },
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } =
      req.body || {};

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
        message: "Enter a valid email address",
      });
    }

    const passwordBytes =
      Buffer.byteLength(password, "utf8");

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

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      authProvider: "local",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: getPublicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
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

    // Google-only accounts cannot use
    // email/password login.
    if (
      !user ||
      !user.passwordHash ||
      user.authProvider === "google"
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

    return sendLoginResponse(res, user);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body || {};

    if (
      typeof credential !== "string" ||
      !credential.trim() ||
      credential.length > 10000
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
      // Verify Google's signature, audience,
      // issuer and token expiration.
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
          "Invalid or expired Google credential",
      });
    }

    if (
      !payload ||
      typeof payload.sub !== "string" ||
      !payload.sub ||
      typeof payload.email !== "string" ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Google account verification failed",
      });
    }

    const normalizedEmail =
      payload.email.trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      !EMAIL_REGEX.test(normalizedEmail)
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Google did not provide a valid email",
      });
    }

    // Existing Google account:
    // Always identify by Google's stable sub,
    // not by the email address.
    let user = await User.findOne({
      googleId: payload.sub,
    });

    if (user) {
      return sendLoginResponse(
        res,
        user,
        "Google login successful"
      );
    }

    // Do not automatically link Google
    // to an existing email/password account.
    const existingEmailUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email. Sign in using your existing method. Account linking will be available later.",
      });
    }

    const googleName =
      typeof payload.name === "string"
        ? payload.name.trim()
        : "";

    const normalizedName =
      googleName.length >= 2
        ? googleName.slice(0, 80)
        : "Google User";

    try {
      user = await User.create({
        name: normalizedName,
        email: normalizedEmail,
        authProvider: "google",
        googleId: payload.sub,
        role: "user",
      });
    } catch (error) {
      if (error.code === 11000) {
        // Handle concurrent requests from
        // the same Google account.
        const existingGoogleUser =
          await User.findOne({
            googleId: payload.sub,
          });

        if (existingGoogleUser) {
          return sendLoginResponse(
            res,
            existingGoogleUser,
            "Google login successful"
          );
        }

        return res.status(409).json({
          success: false,
          message:
            "An account already exists with this email. Sign in using your existing method.",
        });
      }

      throw error;
    }

    return sendLoginResponse(
      res,
      user,
      "Google account created successfully"
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
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
  getCurrentUser,
};
