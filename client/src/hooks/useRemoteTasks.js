
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { taskApi } from "../services/taskApi";

export default function useRemoteTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await taskApi.getAll();

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid task data received from the server."
        );
      }

      setTasks(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createTask = async (taskData) => {
    const created = await taskApi.create(taskData);

    setTasks((previous) => [
      ...previous,
      created,
    ]);

    return created;
  };

  const updateTask = async (taskId, updates) => {
    const updated = await taskApi.update(
      taskId,
      updates
    );

    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? updated : task
      )
    );

    return updated;
  };

  const deleteTask = async (taskId) => {
    await taskApi.delete(taskId);

    setTasks((previous) =>
      previous.filter(
        (task) => task.id !== taskId
      )
    );
  };

  const reorderTasks = async (nextTasks) => {
    // Generate consecutive positions for every column.
    const positions = new Map();

    const normalizedTasks = nextTasks.map(
      (task) => {
        const position =
          positions.get(task.status) || 0;

        positions.set(
          task.status,
          position + 1
        );

        return {
          ...task,
          position,
        };
      }
    );

    const updates = normalizedTasks.map(
      (task) => ({
        id: task.id,
        status: task.status,
        position: task.position,
      })
    );

    // Optimistic UI update.
    setTasks(normalizedTasks);

    try {
      if (updates.length > 0) {
        await taskApi.reorder(updates);
      }
    } catch (err) {
      // Restore the authoritative database state.
      await refetch();
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
}
