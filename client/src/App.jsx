
import { useState } from "react";
import { Toaster, toast } from "sonner";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CreateTaskModal from "./features/tasks/CreateTaskModal";

import usePersistentTasks from "./hooks/usePersistentTasks";

function App() {
  const { tasks, setTasks, resetTasks } =
    usePersistentTasks();

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  // Create or update a task
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData }
            : task
        )
      );

      toast.success("Task updated successfully", {
        description: `"${taskData.title}" has been updated.`,
      });
    } else {
      const newTask = {
        ...taskData,
        id: crypto.randomUUID(),
      };

      setTasks((previous) => [
        ...previous,
        newTask,
      ]);

      toast.success("Task created successfully", {
        description: `"${newTask.title}" has been added to your board.`,
      });
    }

    setIsCreateOpen(false);
    setEditingTask(null);
  };

  // Delete a task
  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find(
      (task) => task.id === taskId
    );

    if (!taskToDelete) {
      toast.error("Task not found", {
        description:
          "The task may have already been removed.",
      });

      return;
    }

    setTasks((previous) =>
      previous.filter(
        (task) => task.id !== taskId
      )
    );

    toast.success("Task deleted", {
      description: `"${taskToDelete.title}" has been removed.`,
    });
  };

  // Open task editor
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsCreateOpen(true);
  };

  // Close task form
  const handleCloseForm = () => {
    setIsCreateOpen(false);
    setEditingTask(null);
  };

  // Reset demo board
  const handleResetTasks = () => {
    resetTasks();

    toast.success("Demo board restored", {
      description:
        "Your original demo tasks are back.",
    });
  };

  // Open create task modal
  const handleNewTask = () => {
    setEditingTask(null);
    setIsCreateOpen(true);
  };

  return (
    <>
      <AppLayout onNewTask={handleNewTask}>
        <Dashboard
          tasks={tasks}
          setTasks={setTasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onResetTasks={handleResetTasks}
        />
      </AppLayout>

      <CreateTaskModal
        isOpen={isCreateOpen}
        task={editingTask}
        onClose={handleCloseForm}
        onSave={handleSaveTask}
      />

      {/* Global Toast Notifications */}
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
