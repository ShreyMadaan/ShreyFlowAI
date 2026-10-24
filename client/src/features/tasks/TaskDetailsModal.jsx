
import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { BOARD_COLUMNS } from "../../data/mockData";

function TaskDetailsModal({
  task,
  onClose,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
}) {
  const [confirmDelete, setConfirmDelete] =
    useState(false);

  useEffect(() => {
    if (!task) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [task, onClose]);

  useEffect(() => {
    setConfirmDelete(false);
  }, [task?.id]);

  if (!task) return null;

  const handleDelete = () => {
    onDeleteTask(task.id);
    onClose();
  };

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
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
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
            className="rounded-lg p-2 hover:bg-surface-secondary"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-5 text-sm leading-7 text-muted">
          {task.description || "No description"}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="details-status"
              className="mb-2 block text-xs font-semibold text-muted"
            >
              Status
            </label>

            <select
              id="details-status"
              value={task.status}
              onChange={(event) =>
                onStatusChange(
                  task.id,
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-app-border bg-surface-secondary px-3 py-2.5 text-sm text-primary"
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
                <button
                  key={subtask.id}
                  type="button"
                  onClick={() =>
                    onToggleSubtask(
                      task.id,
                      subtask.id
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm hover:bg-surface-secondary"
                >
                  {subtask.completed ? (
                    <CheckCircle2
                      size={18}
                      className="text-emerald-500"
                    />
                  ) : (
                    <Circle
                      size={18}
                      className="text-muted"
                    />
                  )}

                  <span
                    className={
                      subtask.completed
                        ? "text-muted line-through"
                        : ""
                    }
                  >
                    {subtask.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-app-border pt-5">
          {confirmDelete ? (
            <>
              <span className="mr-auto self-center text-sm text-red-500">
                Delete this task?
              </span>

              <button
                type="button"
                onClick={() =>
                  setConfirmDelete(false)
                }
                className="rounded-xl border border-app-border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Confirm Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() =>
                  setConfirmDelete(true)
                }
                className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
                Delete
              </button>

              <button
                type="button"
                onClick={() => {
                  onEditTask(task);
                  onClose();
                }}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Pencil size={16} />
                Edit Task
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default TaskDetailsModal;
