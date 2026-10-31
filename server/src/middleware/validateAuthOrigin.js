
const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const validateAuthOrigin = (
  req,
  res,
  next
) => {
  const origin = req.get("Origin");
  const fetchSite =
    req.get("Sec-Fetch-Site");

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

  // Browser requests that include Fetch
  // Metadata must provide an allowed Origin
  // for these authentication mutations.
  if (fetchSite) {
    return res.status(403).json({
      success: false,
      message:
        "Request origin is required",
    });
  }

  // Allows non-browser API clients such
  // as PowerShell and Postman.
  return next();
};

module.exports = validateAuthOrigin;
