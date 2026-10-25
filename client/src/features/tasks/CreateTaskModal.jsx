
import { useEffect, useRef, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { BOARD_COLUMNS } from "../../data/mockData";

import ConfirmModal from "../../components/ui/ConfirmModal";
import useModalFocus from "../../hooks/useModalFocus";

const MAX_TITLE_LENGTH = 120;
const MAX_SUBTASK_LENGTH = 120;

const createEmptyForm = () => ({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  labels: "",
  subtasks: [],
});

const createFormFromTask = (task) => {
  if (!task) {
    return createEmptyForm();
  }

  return {
    title: task.title || "",
    description: task.description || "",
    status: task.status || "todo",
    priority: task.priority || "medium",
    dueDate: task.dueDate || "",
    labels: (task.labels || []).join(", "),
    subtasks: (task.subtasks || []).map(
      (subtask) => ({
        ...subtask,
      })
    ),
  };
};

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizeLabels(value) {
  const seen = new Set();

  return value
    .split(",")
    .map((label) => label.trim())
    .filter((label) => {
      if (!label) return false;

      const normalized = label.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function getSubtaskError(title, subtasks) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return "Enter a subtask title";
  }

  if (trimmedTitle.length > MAX_SUBTASK_LENGTH) {
    return `Subtask must be ${MAX_SUBTASK_LENGTH} characters or fewer`;
  }

  const duplicate = subtasks.some(
    (subtask) =>
      subtask.title.trim().toLowerCase() ===
      trimmedTitle.toLowerCase()
  );

  if (duplicate) {
    return "This subtask already exists";
  }

  return "";
}

function CreateTaskModal({
  isOpen,
  task,
  isSaving = false,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    createEmptyForm
  );

  const [newSubtask, setNewSubtask] =
    useState("");

  const [errors, setErrors] = useState({});

  const [
    showDiscardConfirm,
    setShowDiscardConfirm,
  ] = useState(false);

  const dialogRef = useRef(null);
  const titleInputRef = useRef(null);
  const dueDateInputRef = useRef(null);
  const subtaskInputRef = useRef(null);

  const initialFormRef = useRef(
    createEmptyForm()
  );

  const isEditing = Boolean(task);

  // Reset form when opening or switching tasks.
  useEffect(() => {
    if (!isOpen) return;

    const initialForm = createFormFromTask(task);

    initialFormRef.current = initialForm;

    setForm(initialForm);
    setNewSubtask("");
    setErrors({});
    setShowDiscardConfirm(false);
  }, [isOpen, task]);

  const isDirty =
    JSON.stringify(form) !==
    JSON.stringify(initialFormRef.current) ||
    newSubtask.trim().length > 0;

  // Prevent accidental loss of unsaved changes.
  const requestClose = () => {
    if (isSaving || showDiscardConfirm) return;

    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }

    onClose();
  };

  // Shared keyboard focus management.
  useModalFocus({
    isOpen,
    isTopmost: !showDiscardConfirm,
    dialogRef,
    initialFocusRef: titleInputRef,
    onClose: requestClose,
  });

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
    const error = getSubtaskError(
      newSubtask,
      form.subtasks
    );

    if (error) {
      setErrors((previous) => ({
        ...previous,
        subtask: error,
      }));

      subtaskInputRef.current?.focus();
      return;
    }

    const title = newSubtask.trim();

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

    setErrors((previous) => ({
      ...previous,
      subtask: "",
    }));

    subtaskInputRef.current?.focus();
  };

  const removeSubtask = (id) => {
    setForm((previous) => ({
      ...previous,
      subtasks: previous.subtasks.filter(
        (subtask) => subtask.id !== id
      ),
    }));

    setErrors((previous) => ({
      ...previous,
      subtask: "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSaving) return;
    const validationErrors = {};
    const title = form.title.trim();

    // Validate title.
    if (!title) {
      validationErrors.title =
        "Task title is required";
    } else if (
      title.length > MAX_TITLE_LENGTH
    ) {
      validationErrors.title =
        `Title must be ${MAX_TITLE_LENGTH} characters or fewer`;
    }

    // Validate optional due date.
    if (
      form.dueDate &&
      !isValidDate(form.dueDate)
    ) {
      validationErrors.dueDate =
        "Enter a valid due date";
    }

    // Include a pending subtask when saving.
    let finalSubtasks = [...form.subtasks];

    if (newSubtask.trim()) {
      const subtaskError = getSubtaskError(
        newSubtask,
        finalSubtasks
      );

      if (subtaskError) {
        validationErrors.subtask =
          subtaskError;
      } else {
        finalSubtasks.push({
          id: crypto.randomUUID(),
          title: newSubtask.trim(),
          completed: false,
        });
      }
    }

    // Display errors and focus the first invalid field.
    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);

      requestAnimationFrame(() => {
        if (validationErrors.title) {
          titleInputRef.current?.focus();
        } else if (validationErrors.dueDate) {
          dueDateInputRef.current?.focus();
        } else if (validationErrors.subtask) {
          subtaskInputRef.current?.focus();
        }
      });

      return;
    }

    // Preserve the existing task data structure.
    onSave({
      title,
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      labels: normalizeLabels(form.labels),
      subtasks: finalSubtasks,
    });
  };

  const handleDiscardChanges = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  const inputClass =
    "w-full rounded-xl border border-app-border bg-surface-secondary px-3 py-2.5 text-sm text-primary outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15";

  const errorInputClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500/15";

  const labelClass =
    "mb-2 block text-sm font-medium text-primary";

  return (
    <>
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm sm:p-6"
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget &&
            !showDiscardConfirm
          ) {
            requestClose();
          }
        }}
      >
        <section
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-form-title"
          tabIndex={-1}
          className="max-h-[92dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-app-border bg-surface text-primary shadow-2xl sm:max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 border-b border-app-border px-5 py-5 sm:px-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                Task Management
              </p>

              <h2
                id="task-form-title"
                className="text-xl font-bold tracking-tight"
              >
                {isEditing
                  ? "Edit Task"
                  : "Create New Task"}
              </h2>

              <p className="mt-2 text-xs text-muted">
                {isEditing
                  ? "Update your task details and subtasks."
                  : "Add a task to organize your workflow."}
              </p>
            </div>

            <button
              type="button"
              onClick={requestClose}
              aria-label="Close task form"
              className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-surface-secondary hover:text-primary focus-visible:outline-2 focus-visible:outline-violet-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-busy={isSaving}
          >
            <div className="space-y-6 px-5 py-6 sm:px-6">
              {/* Task Title */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="task-title"
                    className="text-sm font-medium"
                  >
                    Task Title{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <span
                    className={`text-xs ${form.title.length >
                        MAX_TITLE_LENGTH
                        ? "text-red-500"
                        : "text-muted"
                      }`}
                  >
                    {form.title.length}/
                    {MAX_TITLE_LENGTH}
                  </span>
                </div>

                <input
                  ref={titleInputRef}
                  id="task-title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateField(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Build authentication API"
                  aria-required="true"
                  aria-invalid={Boolean(
                    errors.title
                  )}
                  aria-describedby={
                    errors.title
                      ? "task-title-error"
                      : undefined
                  }
                  className={`${inputClass} ${errors.title
                      ? errorInputClass
                      : ""
                    }`}
                />

                {errors.title && (
                  <p
                    id="task-title-error"
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-xs text-red-500"
                  >
                    <AlertCircle size={14} />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="task-description"
                  className={labelClass}
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
                  placeholder="Describe what needs to be done..."
                  rows={4}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Status and Priority */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-status"
                    className={labelClass}
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
                    {BOARD_COLUMNS.map(
                      (column) => (
                        <option
                          key={column.id}
                          value={column.id}
                        >
                          {column.title}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="task-priority"
                    className={labelClass}
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
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label
                  htmlFor="task-due-date"
                  className={labelClass}
                >
                  Due Date
                </label>

                <div className="relative">
                  <input
                    ref={dueDateInputRef}
                    id="task-due-date"
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateField(
                        "dueDate",
                        event.target.value
                      )
                    }
                    aria-invalid={Boolean(
                      errors.dueDate
                    )}
                    aria-describedby={
                      errors.dueDate
                        ? "task-due-date-error"
                        : undefined
                    }
                    className={`${inputClass} ${errors.dueDate
                        ? errorInputClass
                        : ""
                      }`}
                  />
                </div>

                {errors.dueDate && (
                  <p
                    id="task-due-date-error"
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-xs text-red-500"
                  >
                    <AlertCircle size={14} />
                    {errors.dueDate}
                  </p>
                )}

                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <CalendarDays size={13} />
                  Optional — choose a deadline.
                </p>
              </div>

              {/* Labels */}
              <div>
                <label
                  htmlFor="task-labels"
                  className={labelClass}
                >
                  Labels
                </label>

                <input
                  id="task-labels"
                  type="text"
                  value={form.labels}
                  onChange={(event) =>
                    updateField(
                      "labels",
                      event.target.value
                    )
                  }
                  placeholder="Frontend, React, Design"
                  aria-describedby="task-labels-help"
                  className={inputClass}
                />

                <p
                  id="task-labels-help"
                  className="mt-2 text-xs text-muted"
                >
                  Separate labels with commas.
                  Duplicate labels are removed
                  automatically.
                </p>

                {form.labels.trim() && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {normalizeLabels(
                      form.labels
                    ).map((label) => (
                      <span
                        key={label.toLowerCase()}
                        className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-accent"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtasks */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="new-subtask"
                    className="text-sm font-medium"
                  >
                    Subtasks
                  </label>

                  <span className="text-xs text-muted">
                    {form.subtasks.length} added
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    ref={subtaskInputRef}
                    id="new-subtask"
                    type="text"
                    value={newSubtask}
                    onChange={(event) => {
                      setNewSubtask(
                        event.target.value
                      );

                      setErrors((previous) => ({
                        ...previous,
                        subtask: "",
                      }));
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.nativeEvent
                          .isComposing
                      ) {
                        event.preventDefault();
                        addSubtask();
                      }
                    }}
                    placeholder="Add a subtask"
                    aria-invalid={Boolean(
                      errors.subtask
                    )}
                    aria-describedby={
                      errors.subtask
                        ? "task-subtask-error"
                        : "task-subtask-help"
                    }
                    className={`${inputClass} min-w-0 flex-1 ${errors.subtask
                        ? errorInputClass
                        : ""
                      }`}
                  />

                  <button
                    type="button"
                    onClick={addSubtask}
                    aria-label="Add subtask"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {errors.subtask ? (
                  <p
                    id="task-subtask-error"
                    role="alert"
                    className="mt-2 flex items-center gap-1.5 text-xs text-red-500"
                  >
                    <AlertCircle size={14} />
                    {errors.subtask}
                  </p>
                ) : (
                  <p
                    id="task-subtask-help"
                    className="mt-2 text-xs text-muted"
                  >
                    Press Enter or + to add a
                    subtask.
                  </p>
                )}

                {/* Added Subtasks */}
                {form.subtasks.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {form.subtasks.map(
                      (subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-surface-secondary px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${subtask.completed
                                  ? "bg-emerald-500"
                                  : "bg-violet-500"
                                }`}
                            />

                            <span
                              className={`min-w-0 break-words text-sm ${subtask.completed
                                  ? "text-muted line-through"
                                  : ""
                                }`}
                            >
                              {subtask.title}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeSubtask(
                                subtask.id
                              )
                            }
                            aria-label={`Remove ${subtask.title}`}
                            className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer */}
            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-app-border bg-surface px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={requestClose}
                className="rounded-xl border border-app-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-violet-500"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Task"}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Unsaved Changes Confirmation */}
      <ConfirmModal
        isOpen={showDiscardConfirm}
        title="Discard unsaved changes?"
        description="You have unsaved changes to this task. If you leave now, those changes will be lost."
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        variant="danger"
        onClose={() =>
          setShowDiscardConfirm(false)
        }
        onConfirm={handleDiscardChanges}
      />
    </>
  );
}

export default CreateTaskModal;
