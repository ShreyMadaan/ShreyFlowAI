
import { useState } from "react";

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

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...taskData }
            : task
        )
      );
    } else {
      const newTask = {
        ...taskData,
        id: crypto.randomUUID(),
      };

      setTasks((previous) => [
        ...previous,
        newTask,
      ]);
    }

    setIsCreateOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((previous) =>
      previous.filter(
        (task) => task.id !== taskId
      )
    );
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsCreateOpen(true);
  };

  const handleCloseForm = () => {
    setIsCreateOpen(false);
    setEditingTask(null);
  };

  return (
    <>
      <AppLayout
        onNewTask={() => {
          setEditingTask(null);
          setIsCreateOpen(true);
        }}
      >
        <Dashboard
          tasks={tasks}
          setTasks={setTasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onResetTasks={resetTasks}
        />
      </AppLayout>

      <CreateTaskModal
        isOpen={isCreateOpen}
        task={editingTask}
        onClose={handleCloseForm}
        onSave={handleSaveTask}
      />
    </>
  );
}

export default App;
