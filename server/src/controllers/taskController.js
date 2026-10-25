
const mongoose = require("mongoose");
const Task = require("../models/Task");

const ALLOWED_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "dueDate",
  "labels",
  "subtasks",
  "position",
];

const pickFields = (body, fields) => {
  return Object.fromEntries(
    fields
      .filter((field) =>
        Object.prototype.hasOwnProperty.call(
          body,
          field
        )
      )
      .map((field) => [
        field,
        body[field],
      ])
  );
};

// GET /api/tasks
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({})
      .sort({ position: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      id: req.params.id,
    }).lean();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "A task object is required",
      });
    }

    const taskData = pickFields(
      req.body,
      ["id", ...ALLOWED_FIELDS]
    );

    const task = await Task.create(taskData);

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/reorder
const reorderTasks = async (req, res, next) => {
  try {
    const updates = req.body?.updates;

    if (
      !Array.isArray(updates) ||
      updates.length === 0 ||
      updates.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message:
          "updates must contain between 1 and 500 tasks",
      });
    }

    const seenIds = new Set();

    for (const update of updates) {
      if (
        !update ||
        typeof update !== "object" ||
        Array.isArray(update) ||
        typeof update.id !== "string" ||
        !update.id.trim() ||
        typeof update.status !== "string" ||
        !update.status.trim() ||
        !Number.isSafeInteger(update.position) ||
        update.position < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each update requires a valid id, status, and non-negative integer position",
        });
      }

      if (seenIds.has(update.id)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate task IDs are not allowed",
        });
      }

      seenIds.add(update.id);
    }

    const ids = updates.map((update) => update.id);

    // Atlas supports transactions, so either every
    // task update succeeds or none is committed.
    await mongoose.connection.transaction(
      async (session) => {
        const existingTasks = await Task.find({
          id: { $in: ids },
        })
          .select("id")
          .session(session)
          .lean();

        if (existingTasks.length !== ids.length) {
          const error = new Error(
            "One or more tasks were not found"
          );
          error.statusCode = 404;
          throw error;
        }

        const operations = updates.map((update) => ({
          updateOne: {
            filter: { id: update.id },
            update: {
              $set: {
                status: update.status.trim(),
                position: update.position,
              },
            },
          },
        }));

        const result = await Task.bulkWrite(
          operations,
          { session, ordered: true }
        );

        if (result.matchedCount !== ids.length) {
          throw new Error(
            "Not all tasks could be reordered"
          );
        }
      }
    );

    const updatedTasks = await Task.find({
      id: { $in: ids },
    })
      .sort({
        status: 1,
        position: 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Tasks reordered successfully",
      count: updatedTasks.length,
      data: updatedTasks,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message: "A task update object is required",
      });
    }

    const updates = pickFields(
      req.body,
      ALLOWED_FIELDS
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid update fields provided",
      });
    }

    const task = await Task.findOne({
      id: req.params.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    Object.assign(task, updates);
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      id: req.params.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: {
        id: task.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
};
