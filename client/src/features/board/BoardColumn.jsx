
import { useDroppable } from "@dnd-kit/react";

import TaskCard from "./TaskCard";
import TaskDropZone from "./TaskDropZone";

function BoardColumn({
  column,
  tasks,
  onTaskClick,
}) {
  const { ref, isDropTarget } = useDroppable({
    id: `column:${column.id}`,
    data: {
      status: column.id,
    },
  });

  return (
    <section
      ref={ref}
      className={`
        flex w-[290px] min-w-[290px]
        flex-col rounded-2xl border p-3
        transition-colors
        ${
          isDropTarget
            ? "border-violet-500 bg-violet-500/10"
            : "border-app-border bg-surface-secondary/60"
        }
      `}
    >
      <div className="mb-4 flex items-center gap-2 px-1">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{
            backgroundColor: column.color,
          }}
        />

        <h3 className="text-sm font-semibold">
          {column.title}
        </h3>

        <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted">
          {tasks.length}
        </span>
      </div>

      <div className="flex min-h-40 flex-col">
        <TaskDropZone
          columnId={column.id}
          index={0}
        />

        {tasks.map((task, index) => (
          <div key={task.id}>
            <TaskCard
              task={task}
              onClick={onTaskClick}
            />

            <TaskDropZone
              columnId={column.id}
              index={index + 1}
            />
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-app-border p-4 text-center">
            <p className="text-xs text-muted">
              Drop tasks here
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BoardColumn;
