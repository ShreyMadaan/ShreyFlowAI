
import {
  CalendarDays,
  CheckSquare2,
  Flag,
  GripVertical,
} from "lucide-react";

import { useDraggable } from "@dnd-kit/react";

const PRIORITY_STYLES = {
  high: {
    label: "High",
    className: "bg-red-500/10 text-red-500",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-500",
  },
  low: {
    label: "Low",
    className: "bg-emerald-500/10 text-emerald-500",
  },
};

function TaskCard({ task, onClick }) {
  const { ref, handleRef, isDragging } =
    useDraggable({
      id: `task:${task.id}`,
      data: {
        taskId: task.id,
        status: task.status,
      },
    });

  const priority =
    PRIORITY_STYLES[task.priority] ||
    PRIORITY_STYLES.medium;

  const completedSubtasks =
    task.subtasks.filter(
      (subtask) => subtask.completed
    ).length;

  const totalSubtasks = task.subtasks.length;

  const formattedDate = task.dueDate
    ? new Date(
        `${task.dueDate}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <article
      ref={ref}
      className={`
        rounded-xl border border-app-border
        bg-surface p-4 shadow-sm
        transition-shadow
        hover:border-violet-500/50
        hover:shadow-lg
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${priority.className}`}
        >
          <Flag size={12} />
          {priority.label}
        </span>

        <button
          ref={handleRef}
          type="button"
          aria-label={`Drag ${task.title}`}
          title="Drag to another column"
          className="touch-none rounded-md p-1 text-muted hover:bg-surface-secondary hover:text-primary"
        >
          <GripVertical size={17} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onClick(task)}
        className="w-full text-left"
      >
        <h3 className="text-sm font-semibold leading-6">
          {task.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">
          {task.description}
        </p>

        {task.labels.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {task.labels.map((label) => (
              <span
                key={label}
                className="rounded-md bg-violet-500/10 px-2 py-1 text-[10px] font-medium text-accent"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-app-border pt-3 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            {formattedDate && (
              <>
                <CalendarDays size={14} />
                <span>{formattedDate}</span>
              </>
            )}
          </div>

          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1.5">
              <CheckSquare2 size={14} />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}
        </div>
      </button>
    </article>
  );
}

export default TaskCard;
