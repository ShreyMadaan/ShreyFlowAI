
const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Safe HTTP methods do not modify
// authentication or session state.
const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

const validateAuthOrigin = (
  req,
  res,
  next
) => {
  // Allow safe, read-only requests.
  // JWT authentication still protects
  // endpoints such as GET /auth/me.
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.get("Origin");
  const fetchSite =
    req.get("Sec-Fetch-Site");

  // Validate browser requests that
  // provide an Origin header.
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message:
        "Request origin is not allowed",
    });
  }

  // Browser mutation requests must
  // include an approved Origin.
  if (fetchSite) {
    return res.status(403).json({
      success: false,
      message:
        "Request origin is required",
    });
  }

  // Allow non-browser API clients,
  // such as PowerShell and Postman.
  return next();
};

module.exports = validateAuthOrigin;
