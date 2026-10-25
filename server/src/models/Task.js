
const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

const subtaskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: randomUUID,
      required: true,
    },

    title: {
      type: String,
      required: [
        true,
        "Subtask title is required",
      ],
      trim: true,
      maxlength: 120,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const taskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: randomUUID,
    },

    title: {
      type: String,
      required: [
        true,
        "Task title is required",
      ],
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      required: true,
      default: "todo",
      trim: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: {
      type: String,
      default: "",
      validate: {
        validator(value) {
          if (!value) return true;

          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
          }

          const [year, month, day] =
            value.split("-").map(Number);

          const date = new Date(0);
          date.setUTCFullYear(
            year,
            month - 1,
            day
          );

          return (
            date.getUTCFullYear() === year &&
            date.getUTCMonth() === month - 1 &&
            date.getUTCDate() === day
          );
        },
        message:
          "Due date must be a valid YYYY-MM-DD date",
      },
    },

    labels: {
      type: [String],
      default: [],
    },

    subtasks: {
      type: [subtaskSchema],
      default: [],
    },

    // Used later for persistent drag-and-drop ordering.
    position: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
  }
);

taskSchema.index({
  status: 1,
  position: 1,
});

const Task = mongoose.model(
  "Task",
  taskSchema
);

module.exports = Task;
