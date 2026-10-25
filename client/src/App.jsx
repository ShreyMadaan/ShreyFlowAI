
import { useState } from "react";
import { Toaster, toast } from "sonner";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CreateTaskModal from "./features/tasks/CreateTaskModal";

import useRemoteTasks from "./hooks/useRemoteTasks";

function App() {
  const {
    tasks,
    loading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useRemoteTasks();

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [isSaving, setIsSaving] =
    useState(false);

  // Create or update a task in MongoDB.
  const handleSaveTask = async (taskData) => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      if (editingTask) {
        await updateTask(
          editingTask.id,
          taskData
        );

        toast.success(
          "Task updated successfully",
          {
            description: `"${taskData.title}" has been updated.`,
          }
        );
      } else {
        await createTask({
          ...taskData,
          position: tasks.filter(
            (task) =>
              task.status === taskData.status
          ).length,
        });

        toast.success(
          "Task created successfully",
          {
            description: `"${taskData.title}" has been added to your board.`,
          }
        );
      }

      // Close only after MongoDB confirms success.
      setIsCreateOpen(false);
      setEditingTask(null);
    } catch (err) {
      toast.error("Unable to save task", {
        description: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a task from MongoDB.
  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task) {
      toast.error("Task not found");
      return;
    }

    try {
      await deleteTask(taskId);

      toast.success("Task deleted", {
        description: `"${task.title}" has been removed.`,
      });
    } catch (err) {
      toast.error("Unable to delete task", {
        description: err.message,
      });
    }
  };

  // Persist a task's workflow status.
  const handleStatusChange = async (
    taskId,
    status
  ) => {
    return updateTask(taskId, { status });
  };

  // Persist subtask completion.
  const handleToggleSubtask = async (
    taskId,
    subtaskId
  ) => {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task) {
      throw new Error("Task not found");
    }

    const subtasks = task.subtasks.map(
      (subtask) =>
        subtask.id === subtaskId
          ? {
              ...subtask,
              completed:
                !subtask.completed,
            }
          : subtask
    );

    return updateTask(taskId, {
      subtasks,
    });
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsCreateOpen(true);
  };

  const handleCloseForm = () => {
    if (isSaving) return;

    setIsCreateOpen(false);
    setEditingTask(null);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsCreateOpen(true);
  };

  return (
    <>
      <AppLayout onNewTask={handleNewTask}>
        <Dashboard
          tasks={tasks}
          loading={loading}
          error={error}
          onRefresh={refetch}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onToggleSubtask={handleToggleSubtask}
          onReorder={reorderTasks}
        />
      </AppLayout>

      <CreateTaskModal
        isOpen={isCreateOpen}
        task={editingTask}
        isSaving={isSaving}
        onClose={handleCloseForm}
        onSave={handleSaveTask}
      />

      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={3500}
        visibleToasts={4}
        gap={12}
        theme="system"
        mobileOffset={16}
        toastOptions={{
          className: "font-sans",
        }}
      />
    </>
  );
}

export default App;
