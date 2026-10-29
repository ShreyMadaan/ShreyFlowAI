
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Enter a valid email address",
      ],
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
      immutable: true,
    },

    // Required only for email/password accounts.
    passwordHash: {
      type: String,
      select: false,
      required: function () {
        return this.authProvider === "local";
      },
    },

    // Google's stable account identifier (sub).
    // Existing local accounts do not have this field.
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      immutable: true,
      required: function () {
        return this.authProvider === "google";
      },
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);
