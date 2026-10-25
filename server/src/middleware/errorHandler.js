
const errorHandler = (err, req, res, next) => {
  // Mongoose schema validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(
      err.errors
    ).map((error) => error.message);

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Duplicate unique fields
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A task with this ID already exists",
    });
  }

  // Invalid field values
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid field value",
    });
  }

  // Invalid JSON request body
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode < 600
      ? err.statusCode
      : 500;

  console.error(
    `[ERROR] ${req.method} ${req.originalUrl}`,
    err
  );

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
};

module.exports = errorHandler;
