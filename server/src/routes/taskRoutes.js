
const express = require("express");

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} = require("../controllers/taskController");

const router = express.Router();

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
