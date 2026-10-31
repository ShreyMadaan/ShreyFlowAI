
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { taskApi } from "../services/taskApi";

export default function useRemoteTasks(
  token,
  refreshSession
) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const requestVersion = useRef(0);

  // Always reference the latest access token,
  // even if an async operation started earlier.
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestVersion.current += 1;
    };
  }, []);

  // ==========================================
  // Execute task request with JWT recovery
  // ==========================================

  const requestWithRefresh = useCallback(
    async (operation) => {
      const originalToken = tokenRef.current;

      try {
        return await operation(originalToken);
      } catch (originalError) {
        // Only authentication failures trigger
        // a token refresh. Other errors propagate.
        if (originalError.status !== 401) {
          throw originalError;
        }

        let nextToken = tokenRef.current;

        // Another request may have refreshed the
        // access token while this one was running.
        if (
          !nextToken ||
          nextToken === originalToken
        ) {
          // AuthContext shares concurrent refresh
          // requests and handles invalid sessions.
          const renewedSession =
            await refreshSession();

          nextToken = renewedSession?.token;
        }

        // Do not retry if the refresh session
        // is invalid, expired, or was logged out.
        if (!nextToken) {
          throw originalError;
        }

        if (!mountedRef.current) {
          throw originalError;
        }

        tokenRef.current = nextToken;

        // Retry exactly once with the renewed JWT.
        // If this request fails, its error propagates.
        return operation(nextToken);
      }
    },
    [refreshSession]
  );

  // ==========================================
  // Fetch all tasks
  // ==========================================

  const refetch = useCallback(async () => {
    const version = ++requestVersion.current;

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await requestWithRefresh(
        (accessToken) =>
          taskApi.getAll(accessToken)
      );

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid task data received from the server."
        );
      }

      if (
        mountedRef.current &&
        version === requestVersion.current
      ) {
        setTasks(data);
      }

      return data;
    } catch (err) {
      if (
        mountedRef.current &&
        version === requestVersion.current
      ) {
        setError(err.message);
      }

      return null;
    } finally {
      if (
        mountedRef.current &&
        version === requestVersion.current
      ) {
        setLoading(false);
      }
    }
  }, [requestWithRefresh]);

  // Load tasks on mount, not every time
  // the access JWT rotates.
  useEffect(() => {
    refetch();

    return () => {
      requestVersion.current += 1;
    };
  }, [refetch]);

  // ==========================================
  // Create task
  // ==========================================

  const createTask = async (taskData) => {
    const created = await requestWithRefresh(
      (accessToken) =>
        taskApi.create(
          accessToken,
          taskData
        )
    );

    if (mountedRef.current) {
      setTasks((previous) => [
        ...previous,
        created,
      ]);
    }

    return created;
  };

  // ==========================================
  // Update task
  // ==========================================

  const updateTask = async (
    taskId,
    updates
  ) => {
    const updated = await requestWithRefresh(
      (accessToken) =>
        taskApi.update(
          accessToken,
          taskId,
          updates
        )
    );

    if (mountedRef.current) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId
            ? updated
            : task
        )
      );
    }

    return updated;
  };

  // ==========================================
  // Delete task
  // ==========================================

  const deleteTask = async (taskId) => {
    await requestWithRefresh(
      (accessToken) =>
        taskApi.delete(
          accessToken,
          taskId
        )
    );

    if (mountedRef.current) {
      setTasks((previous) =>
        previous.filter(
          (task) => task.id !== taskId
        )
      );
    }
  };

  // ==========================================
  // Reorder tasks (drag-and-drop)
  // ==========================================

  const reorderTasks = async (nextTasks) => {
    const previousTasks = tasksRef.current;

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

    // Optimistically update the board.
    tasksRef.current = normalizedTasks;
    setTasks(normalizedTasks);

    try {
      if (updates.length > 0) {
        await requestWithRefresh(
          (accessToken) =>
            taskApi.reorder(
              accessToken,
              updates
            )
        );
      }
    } catch (err) {
      // Undo optimistic changes if both
      // the original request and retry fail.
      if (mountedRef.current) {
        tasksRef.current = previousTasks;
        setTasks(previousTasks);

        // Reconcile with the server if this
        // was not an authentication failure.
        if (err.status !== 401) {
          await refetch();
        }
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
