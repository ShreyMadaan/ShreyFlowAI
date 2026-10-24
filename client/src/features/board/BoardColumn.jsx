
import TaskCard from "./TaskCard";

function BoardColumn({
  column,
  tasks,
  onTaskClick,
}) {
  return (
    <section className="flex w-[290px] min-w-[290px] flex-col rounded-2xl border border-app-border bg-surface-secondary/60 p-3">
      {/* Column header */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: column.color }}
          />

          <h3 className="text-sm font-semibold">
            {column.title}
          </h3>

          <span className="rounded-md bg-surface px-2 py-0.5 text-xs text-muted">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task cards */}
      <div className="flex min-h-40 flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={onTaskClick}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-app-border p-4 text-center">
            <p className="text-xs text-muted">
              No tasks in this column
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BoardColumn;
