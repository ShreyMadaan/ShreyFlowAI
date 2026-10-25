
require("dotenv").config();

const dns = require("node:dns");
const mongoose = require("mongoose");

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Configure custom DNS resolvers before connecting to Atlas.
if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  dns.setServers(servers);

  console.log(
    "Custom DNS resolvers configured:",
    servers.join(", ")
  );
}

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(
        `ShreyFlowAI API running on http://localhost:${PORT}`
      );

      console.log(
        `Environment: ${
          process.env.NODE_ENV || "development"
        }`
      );
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(
    `${signal} received. Shutting down...`
  );

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }

    await mongoose.connection.close();

    console.log(
      "Server and database connections closed."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Shutdown failed:",
      error.message
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

startServer();
