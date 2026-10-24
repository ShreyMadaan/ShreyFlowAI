
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { BOARD_COLUMNS } from "../../data/mockData";

const createEmptyForm = () => ({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  labels: "",
  subtasks: [],
});

function CreateTaskModal({
  isOpen,
  task,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(createEmptyForm);
  const [newSubtask, setNewSubtask] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      setForm({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || "",
        labels: task.labels.join(", "),
        subtasks: task.subtasks.map((subtask) => ({
          ...subtask,
        })),
      });
    } else {
      setForm(createEmptyForm());
    }

    setNewSubtask("");
    setErrors({});
  }, [task, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () =>
      window.removeEventListener(
        "keydown",
        handleEscape
      );
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const addSubtask = () => {
    const title = newSubtask.trim();

    if (!title) return;

    setForm((previous) => ({
      ...previous,
      subtasks: [
        ...previous.subtasks,
        {
          id: crypto.randomUUID(),
          title,
          completed: false,
        },
      ],
    }));

    setNewSubtask("");
  };

  const removeSubtask = (id) => {
    setForm((previous) => ({
      ...previous,
      subtasks: previous.subtasks.filter(
        (subtask) => subtask.id !== id
      ),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = {};

    if (!form.title.trim()) {
      validationErrors.title =
        "Task title is required";
    } else if (form.title.trim().length > 120) {
      validationErrors.title =
        "Title must be 120 characters or fewer";
    }

    if (
      form.dueDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(form.dueDate)
    ) {
      validationErrors.dueDate =
        "Enter a valid due date";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      labels: [
        ...new Set(
          form.labels
            .split(",")
            .map((label) => label.trim())
            .filter(Boolean)
        ),
      ],
      subtasks: form.subtasks,
    });
  };

  const inputClass =
    "w-full rounded-xl border border-app-border bg-surface-secondary px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-violet-500";

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-app-border bg-surface p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
              Task Management
            </p>

            <h2
              id="task-form-title"
              className="text-xl font-bold"
            >
              {task ? "Edit Task" : "Create New Task"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="rounded-lg p-2 hover:bg-surface-secondary"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium"
            >
              Task Title *
            </label>

            <input
              id="task-title"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              placeholder="Enter task title"
              maxLength={121}
              aria-invalid={Boolean(errors.title)}
              className={inputClass}
            />

            {errors.title && (
              <p className="mt-1 text-xs text-red-500">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe your task..."
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-status"
                className="mb-2 block text-sm font-medium"
              >
                Status
              </label>

              <select
                id="task-status"
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value
                  )
                }
                className={inputClass}
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
              <label
                htmlFor="task-priority"
                className="mb-2 block text-sm font-medium"
              >
                Priority
              </label>

              <select
                id="task-priority"
                value={form.priority}
                onChange={(event) =>
                  updateField(
                    "priority",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="mb-2 block text-sm font-medium"
            >
              Due Date
            </label>

            <input
              id="task-due-date"
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                updateField(
                  "dueDate",
                  event.target.value
                )
              }
              className={inputClass}
            />

            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-500">
                {errors.dueDate}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-labels"
              className="mb-2 block text-sm font-medium"
            >
              Labels
            </label>

            <input
              id="task-labels"
              value={form.labels}
              onChange={(event) =>
                updateField(
                  "labels",
                  event.target.value
                )
              }
              placeholder="Frontend, React, Design"
              className={inputClass}
            />

            <p className="mt-1 text-xs text-muted">
              Separate labels with commas.
            </p>
          </div>

          {/* Subtasks */}
          <div>
            <label
              htmlFor="new-subtask"
              className="mb-2 block text-sm font-medium"
            >
              Subtasks
            </label>

            <div className="flex gap-2">
              <input
                id="new-subtask"
                value={newSubtask}
                onChange={(event) =>
                  setNewSubtask(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a subtask"
                className={inputClass}
              />

              <button
                type="button"
                onClick={addSubtask}
                aria-label="Add subtask"
                className="rounded-xl bg-violet-600 px-4 text-white hover:bg-violet-700"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {form.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-surface-secondary px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm">
                    {subtask.title}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeSubtask(subtask.id)
                    }
                    aria-label={`Remove ${subtask.title}`}
                    className="shrink-0 text-muted hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-app-border pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-app-border px-4 py-2.5 text-sm font-medium hover:bg-surface-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateTaskModal;
