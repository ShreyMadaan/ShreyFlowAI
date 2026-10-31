
import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster, toast } from "sonner";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CreateTaskModal from "./features/tasks/CreateTaskModal";
import AuthPage from "./features/auth/AuthPage";

import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";

import useRemoteTasks from "./hooks/useRemoteTasks";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

function AuthenticatedWorkspace() {
  const {
    token,
    refreshSession,
  } = useAuth();

  const {
    tasks,
    loading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  } = useRemoteTasks(
    token,
    refreshSession
  );

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [isSaving, setIsSaving] =
    useState(false);

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

      setIsCreateOpen(false);
      setEditingTask(null);
    } catch (err) {
      if (err.status !== 401) {
        toast.error(
          "Unable to save task",
          {
            description: err.message,
          }
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

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
      if (err.status !== 401) {
        toast.error(
          "Unable to delete task",
          {
            description: err.message,
          }
        );
      }
    }
  };

  const handleStatusChange = async (
    taskId,
    status
  ) => {
    return updateTask(taskId, {
      status,
    });
  };

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
    </>
  );
}

function AppContent() {
  const {
    isAuthenticated,
    isInitializing,
    initializationError,
    user,
    refreshSession,
  } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app text-primary">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />

          <h2 className="text-lg font-semibold">
            ShreyFlowAI
          </h2>

          <p className="mt-2 text-sm text-muted">
            Restoring your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (
    initializationError &&
    !isAuthenticated
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app px-5 text-primary">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-xl font-bold">
            Unable to restore session
          </h2>

          <p className="mt-3 text-sm text-muted">
            {initializationError}
          </p>

          <button
            type="button"
            onClick={() => {
              refreshSession().catch(() => {});
            }}
            className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <AuthenticatedWorkspace
          key={user.id}
        />
      ) : (
        <AuthPage />
      )}

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

function App() {
  const content = (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );

  if (!GOOGLE_CLIENT_ID) {
    return content;
  }

  return (
    <GoogleOAuthProvider
      clientId={GOOGLE_CLIENT_ID}
    >
      {content}
    </GoogleOAuthProvider>
  );
}

export default App;
