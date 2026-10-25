
import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  DragDropProvider,
  DragOverlay,
} from "@dnd-kit/react";

import { AutoScroller } from "@dnd-kit/dom";
import { toast } from "sonner";

import { BOARD_COLUMNS } from "../../data/mockData";

import BoardColumn from "./BoardColumn";
import TaskDetailsModal from "../tasks/TaskDetailsModal";

// Configure automatic scrolling while dragging.
const configureDragPlugins = (defaults) => [
  ...defaults.filter(
    (plugin) => plugin !== AutoScroller
  ),
  AutoScroller.configure({
    acceleration: 15,
    threshold: {
      x: 0.22,
      y: 0.12,
    },
  }),
];

// Calculate the next task order without mutating
// the existing React state.
function moveTask(
  previous,
  taskId,
  targetId,
  targetStatus,
  targetIndex
) {
  const draggedTask = previous.find(
    (task) => task.id === taskId
  );

  if (!draggedTask) return previous;

  const remaining = previous.filter(
    (task) => task.id !== taskId
  );

  const movedTask = {
    ...draggedTask,
    status: targetStatus,
  };

  const appendToColumn = () => {
    const lastIndex = remaining.reduce(
      (result, task, index) =>
        task.status === targetStatus
          ? index
          : result,
      -1
    );

    remaining.splice(
      lastIndex + 1,
      0,
      movedTask
    );

    return remaining;
  };

  let result;

  if (targetId.startsWith("column:")) {
    result = appendToColumn();
  } else if (targetId.startsWith("slot:")) {
    if (!Number.isInteger(targetIndex)) {
      return previous;
    }

    const columnTasks = remaining.filter(
      (task) => task.status === targetStatus
    );

    const originalColumnTasks =
      previous.filter(
        (task) => task.status === targetStatus
      );

    const originalIndex =
      originalColumnTasks.findIndex(
        (task) => task.id === taskId
      );

    let adjustedIndex = targetIndex;

    if (
      draggedTask.status === targetStatus &&
      originalIndex !== -1 &&
      originalIndex < targetIndex
    ) {
      adjustedIndex -= 1;
    }

    const safeIndex = Math.max(
      0,
      Math.min(
        adjustedIndex,
        columnTasks.length
      )
    );

    if (safeIndex === columnTasks.length) {
      result = appendToColumn();
    } else {
      const nextTask = columnTasks[safeIndex];

      const insertionIndex =
        remaining.findIndex(
          (task) => task.id === nextTask.id
        );

      remaining.splice(
        insertionIndex,
        0,
        movedTask
      );

      result = remaining;
    }
  } else {
    return previous;
  }

  // Ignore drops that do not change task order
  // or workflow status.
  const unchanged =
    previous.length === result.length &&
    previous.every(
      (task, index) =>
        task.id === result[index].id &&
        task.status === result[index].status
    );

  return unchanged ? previous : result;
}

function Board({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onToggleSubtask,
  onReorder,
}) {
  const [
    selectedTaskId,
    setSelectedTaskId,
  ] = useState(null);

  // Prevent simultaneous reorder requests.
  const isReorderingRef = useRef(false);

  const selectedTask =
    tasks.find(
      (task) => task.id === selectedTaskId
    ) || null;

  // Persist task status changes to MongoDB.
  const handleStatusChange = async (
    taskId,
    status
  ) => {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task || task.status === status) {
      return;
    }

    const column = BOARD_COLUMNS.find(
      (item) => item.id === status
    );

    if (!column) return;

    try {
      await onStatusChange(taskId, status);

      toast.success(
        `Task moved to ${column.title}`,
        {
          description: `"${task.title}" has been updated.`,
        }
      );
    } catch (err) {
      toast.error("Unable to move task", {
        description: err.message,
      });
    }
  };

  // Persist subtask completion to MongoDB.
  const handleToggleSubtask = async (
    taskId,
    subtaskId
  ) => {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    const subtask = task?.subtasks?.find(
      (item) => item.id === subtaskId
    );

    if (!subtask) return;

    try {
      await onToggleSubtask(
        taskId,
        subtaskId
      );

      if (subtask.completed) {
        toast.info("Subtask reopened", {
          description: subtask.title,
        });
      } else {
        toast.success("Subtask completed", {
          description: subtask.title,
        });
      }
    } catch (err) {
      toast.error(
        "Unable to update subtask",
        {
          description: err.message,
        }
      );
    }
  };

  // Persist drag-and-drop changes to MongoDB.
  const handleDragEnd = async (event) => {
    if (
      event.canceled ||
      isReorderingRef.current
    ) {
      return;
    }

    const { source, target } =
      event.operation || {};

    if (!source || !target) return;

    const sourceId = String(source.id);
    const targetId = String(target.id);

    if (!sourceId.startsWith("task:")) {
      return;
    }

    const taskId = sourceId.slice(5);
    const targetStatus =
      target.data?.status;

    const targetColumn = BOARD_COLUMNS.find(
      (column) =>
        column.id === targetStatus
    );

    if (!targetColumn) return;

    const draggedTask = tasks.find(
      (task) => task.id === taskId
    );

    if (!draggedTask) return;

    const nextTasks = moveTask(
      tasks,
      taskId,
      targetId,
      targetStatus,
      target.data?.index
    );

    // No API request for unchanged positions.
    if (nextTasks === tasks) return;

    isReorderingRef.current = true;

    try {
      // onReorder performs the optimistic update
      // and persists positions through the API.
      await onReorder(nextTasks);

      if (
        draggedTask.status !== targetStatus
      ) {
        toast.success(
          `Task moved to ${targetColumn.title}`,
          {
            description: `"${draggedTask.title}" has been moved.`,
          }
        );
      } else {
        toast.info("Task reordered", {
          description: `"${draggedTask.title}" has been repositioned.`,
        });
      }
    } catch (err) {
      toast.error(
        "Unable to save task order",
        {
          description: err.message,
        }
      );
    } finally {
      isReorderingRef.current = false;
    }
  };

  const closeTaskDetails = useCallback(
    () => setSelectedTaskId(null),
    []
  );

  return (
    <>
      <p className="mb-3 text-xs text-muted lg:hidden">
        Swipe horizontally to explore all board
        columns.
      </p>

      <DragDropProvider
        plugins={configureDragPlugins}
        onDragEnd={handleDragEnd}
      >
        <div
          aria-label="Kanban board columns"
          className="overscroll-x-contain overflow-x-auto pb-5"
        >
          <div className="flex w-max gap-4">
            {BOARD_COLUMNS.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={tasks.filter(
                  (task) =>
                    task.status === column.id
                )}
                onTaskClick={(task) =>
                  setSelectedTaskId(task.id)
                }
              />
            ))}
          </div>
        </div>

        {/* Floating drag preview */}
        <DragOverlay
          dropAnimation={{
            duration: 150,
            easing: "ease-out",
          }}
        >
          {(source) => {
            const sourceId = String(
              source.id
            );

            if (
              !sourceId.startsWith("task:")
            ) {
              return null;
            }

            const task = tasks.find(
              (item) =>
                item.id === sourceId.slice(5)
            );

            if (!task) return null;

            return (
              <div className="w-[290px] cursor-grabbing rounded-xl border-2 border-violet-500 bg-surface p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-md bg-violet-500/10 px-2 py-1 text-[11px] font-semibold capitalize text-accent">
                    {task.priority || "medium"} priority
                  </span>

                  <span className="text-xs font-medium text-muted">
                    Moving task
                  </span>
                </div>

                <h3 className="text-sm font-semibold leading-6">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
                    {task.description}
                  </p>
                )}

                {task.labels?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
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
              </div>
            );
          }}
        </DragOverlay>
      </DragDropProvider>

      {/* Task Details */}
      <TaskDetailsModal
        task={selectedTask}
        onClose={closeTaskDetails}
        onStatusChange={handleStatusChange}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onToggleSubtask={handleToggleSubtask}
      />
    </>
  );
}

export default Board;
