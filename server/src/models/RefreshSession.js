
const mongoose = require("mongoose");

const refreshSessionSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      // SHA-256 hash of the opaque refresh token.
      // Never store the raw refresh token.
      tokenHash: {
        type: String,
        required: true,
        unique: true,
        select: false,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      revokedAt: {
        type: Date,
        default: null,
      },

      lastUsedAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

// MongoDB automatically removes expired
// sessions after their expiration time.
// TTL deletion may not happen immediately.
refreshSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  "RefreshSession",
  refreshSessionSchema
);
