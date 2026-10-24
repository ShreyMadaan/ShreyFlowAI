
import { useEffect } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Flag,
  X,
} from "lucide-react";

import { BOARD_COLUMNS } from "../../data/mockData";

function TaskDetailsModal({
  task,
  onClose,
  onStatusChange,
}) {
  useEffect(() => {
    if (!task) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [task, onClose]);

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-app-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
              Task Details
            </p>

            <h2
              id="task-details-title"
              className="text-xl font-bold"
            >
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="rounded-lg p-2 text-muted hover:bg-surface-secondary"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-5 text-sm leading-7 text-muted">
          {task.description}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="task-status"
              className="mb-2 block text-xs font-semibold text-muted"
            >
              Status
            </label>

            <select
              id="task-status"
              value={task.status}
              onChange={(event) =>
                onStatusChange(
                  task.id,
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-app-border bg-surface-secondary px-3 py-2.5 text-sm text-primary outline-none focus:border-violet-500"
            >
              {BOARD_COLUMNS.map((column) => (
                <option
                  key={column.id}
                  value={column.id}
                >
                  {column.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted">
              Priority
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-app-border bg-surface-secondary px-3 py-2.5 text-sm capitalize">
              <Flag size={16} />
              {task.priority}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted">
              Due Date
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-app-border bg-surface-secondary px-3 py-2.5 text-sm">
              <CalendarDays size={16} />
              {task.dueDate || "Not set"}
            </div>
          </div>
        </div>

        {task.labels.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold text-muted">
              Labels
            </p>

            <div className="flex flex-wrap gap-2">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-accent"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {task.subtasks.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold text-muted">
              Subtasks
            </p>

            <div className="space-y-3">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <CheckCircle2
                    size={17}
                    className={
                      subtask.completed
                        ? "text-emerald-500"
                        : "text-muted"
                    }
                  />

                  <span
                    className={
                      subtask.completed
                        ? "text-muted line-through"
                        : ""
                    }
                  >
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default TaskDetailsModal;
