
const getHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "ShreyFlowAI API is running",
    data: {
      status: "healthy",
      environment:
        process.env.NODE_ENV || "development",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = {
  getHealth,
};
