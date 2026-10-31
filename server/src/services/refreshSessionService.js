
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const RefreshSession = require(
  "../models/RefreshSession"
);

const ACCESS_TOKEN_EXPIRY_SECONDS = 900;
const REFRESH_TOKEN_EXPIRY_MS =
  7 * 24 * 60 * 60 * 1000;

const isProduction =
  process.env.NODE_ENV === "production";

const sameSite = (
  process.env.REFRESH_COOKIE_SAME_SITE ||
  "lax"
).toLowerCase();

if (!["lax", "strict", "none"].includes(sameSite)) {
  throw new Error(
    "Invalid REFRESH_COOKIE_SAME_SITE"
  );
}

const secureCookie =
  isProduction || sameSite === "none";

const COOKIE_NAME = secureCookie
  ? "__Host-shreyflow_refresh"
  : "shreyflow_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: secureCookie,
  sameSite,
  path: "/",
};

const generateRefreshToken = () =>
  crypto.randomBytes(48).toString("base64url");

const hashRefreshToken = (token) =>
  crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

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
      expiresIn:
        ACCESS_TOKEN_EXPIRY_SECONDS,
    }
  );
};

const setRefreshCookie = (
  res,
  token,
  expiresAt
) => {
  const remainingMs =
    expiresAt.getTime() - Date.now();

  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: Math.max(1, remainingMs),
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(
    COOKIE_NAME,
    cookieOptions
  );
};

const getRefreshToken = (req) =>
  req.cookies?.[COOKIE_NAME] || null;

const createRefreshSession = async (
  user,
  res
) => {
  // Validate JWT configuration before
  // writing a new database session.
  const accessToken =
    generateAccessToken(user);

  const refreshToken =
    generateRefreshToken();

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY_MS
  );

  await RefreshSession.create({
    user: user._id,
    tokenHash:
      hashRefreshToken(refreshToken),
    expiresAt,
  });

  setRefreshCookie(
    res,
    refreshToken,
    expiresAt
  );

  return {
    token: accessToken,
    tokenType: "Bearer",
    expiresIn:
      ACCESS_TOKEN_EXPIRY_SECONDS,
  };
};

const rotateRefreshSession = async (
  refreshToken,
  res
) => {
  const currentHash =
    hashRefreshToken(refreshToken);

  const nextToken =
    generateRefreshToken();

  const nextHash =
    hashRefreshToken(nextToken);

  const now = new Date();

  // Atomic conditional update:
  // only one request can rotate a
  // particular token successfully.
  const session =
    await RefreshSession.findOneAndUpdate(
      {
        tokenHash: currentHash,
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          tokenHash: nextHash,
          lastUsedAt: now,
        },
      },
      {
        new: true,
      }
    );

  if (!session) {
    return null;
  }

  setRefreshCookie(
    res,
    nextToken,
    session.expiresAt
  );

  return session;
};

const revokeRefreshSession = async (
  refreshToken
) => {
  if (!refreshToken) return;

  await RefreshSession.updateOne(
    {
      tokenHash:
        hashRefreshToken(refreshToken),
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    }
  );
};

module.exports = {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  generateAccessToken,
  createRefreshSession,
  rotateRefreshSession,
  revokeRefreshSession,
  getRefreshToken,
  clearRefreshCookie,
};
