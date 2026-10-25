
import { useCallback, useState } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { AutoScroller } from "@dnd-kit/dom";
import { toast } from "sonner";

import { BOARD_COLUMNS } from "../../data/mockData";

import BoardColumn from "./BoardColumn";
import TaskDetailsModal from "../tasks/TaskDetailsModal";

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

  // Do not update state or notify when nothing changed.
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
  setTasks,
  onEditTask,
  onDeleteTask,
}) {
  const [
    selectedTaskId,
    setSelectedTaskId,
  ] = useState(null);

  const selectedTask =
    tasks.find(
      (task) => task.id === selectedTaskId
    ) || null;

  // Change task status from details modal
  const handleStatusChange = (
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

    setTasks((previous) =>
      previous.map((item) =>
        item.id === taskId
          ? { ...item, status }
          : item
      )
    );

    toast.success(
      `Task moved to ${column.title}`,
      {
        description: `"${task.title}" has been updated.`,
      }
    );
  };

  // Toggle subtask completion
  const handleToggleSubtask = (
    taskId,
    subtaskId
  ) => {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    const subtask = task?.subtasks.find(
      (item) => item.id === subtaskId
    );

    if (!task || !subtask) return;

    setTasks((previous) =>
      previous.map((item) =>
        item.id !== taskId
          ? item
          : {
              ...item,
              subtasks: item.subtasks.map(
                (currentSubtask) =>
                  currentSubtask.id === subtaskId
                    ? {
                        ...currentSubtask,
                        completed:
                          !currentSubtask.completed,
                      }
                    : currentSubtask
              ),
            }
      )
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
  };

  // Drag-and-drop task movement
  const handleDragEnd = (event) => {
    if (event.canceled) return;

    const { source, target } =
      event.operation;

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

    // Ignore drops that do not change anything.
    if (nextTasks === tasks) return;

    setTasks(nextTasks);

    if (draggedTask.status !== targetStatus) {
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
            const sourceId = String(source.id);

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
