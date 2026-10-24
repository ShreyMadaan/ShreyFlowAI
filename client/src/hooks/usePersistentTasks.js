
import { useEffect, useState } from "react";
import { INITIAL_TASKS } from "../data/mockData";

const STORAGE_KEY = "shreyflow-tasks-v1";

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return INITIAL_TASKS;
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load tasks:", error);
  }

  return INITIAL_TASKS;
}

export default function usePersistentTasks() {
  const [tasks, setTasks] = useState(loadTasks);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
      );
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  }, [tasks]);

  const resetTasks = () => {
    setTasks(
      structuredClone(INITIAL_TASKS)
    );
  };

  return {
    tasks,
    setTasks,
    resetTasks,
  };
}
