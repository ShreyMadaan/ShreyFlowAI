
const express = require("express");

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} = require("../controllers/taskController");

const requireAuth = require(
  "../middleware/authMiddleware"
);

const router = express.Router();

// Protect every route defined below.
router.use(requireAuth);

router
  .route("/")
  .get(getAllTasks)
  .post(createTask);

// IMPORTANT:
// Define /reorder before /:id
router.patch("/reorder", reorderTasks);

router
  .route("/:id")
  .get(getTaskById)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
