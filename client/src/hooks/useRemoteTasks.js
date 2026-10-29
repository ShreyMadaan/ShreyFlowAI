
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { taskApi } from "../services/taskApi";

export default function useRemoteTasks(
  token,
  onUnauthorized
) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent outdated fetches from overwriting
  // newer task data.
  const requestVersion = useRef(0);

  const handleRequestError = useCallback(
    (err) => {
      if (err.status === 401) {
        onUnauthorized?.(token);
      }

      return err;
    },
    [token, onUnauthorized]
  );

  const refetch = useCallback(async () => {
    const version = ++requestVersion.current;

    setLoading(true);
    setError(null);

    try {
      const data = await taskApi.getAll(token);

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid task data received from the server."
        );
      }

      if (version === requestVersion.current) {
        setTasks(data);
      }

      return data;
    } catch (err) {
      if (version === requestVersion.current) {
        setError(err.message);
        handleRequestError(err);
      }

      return null;
    } finally {
      if (version === requestVersion.current) {
        setLoading(false);
      }
    }
  }, [token, handleRequestError]);

  useEffect(() => {
    refetch();

    return () => {
      // Invalidate outstanding fetches when
      // the component unmounts or token changes.
      requestVersion.current += 1;
    };
  }, [refetch]);

  const createTask = async (taskData) => {
    try {
      const created = await taskApi.create(
        token,
        taskData
      );

      setTasks((previous) => [
        ...previous,
        created,
      ]);

      return created;
    } catch (err) {
      throw handleRequestError(err);
    }
  };

  const updateTask = async (
    taskId,
    updates
  ) => {
    try {
      const updated = await taskApi.update(
        token,
        taskId,
        updates
      );

      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId
            ? updated
            : task
        )
      );

      return updated;
    } catch (err) {
      throw handleRequestError(err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskApi.delete(token, taskId);

      setTasks((previous) =>
        previous.filter(
          (task) => task.id !== taskId
        )
      );
    } catch (err) {
      throw handleRequestError(err);
    }
  };

  const reorderTasks = async (nextTasks) => {
    const positions = new Map();

    const normalizedTasks = nextTasks.map(
      (task) => {
        const position =
          positions.get(task.status) ?? 0;

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

    setTasks(normalizedTasks);

    try {
      if (updates.length > 0) {
        await taskApi.reorder(
          token,
          updates
        );
      }
    } catch (err) {
      handleRequestError(err);

      if (err.status !== 401) {
        await refetch();
      }

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
