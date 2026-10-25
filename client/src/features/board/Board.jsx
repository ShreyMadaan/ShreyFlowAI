
import { useCallback, useState } from "react";
import {
  DragDropProvider,
  DragOverlay,
} from "@dnd-kit/react";

import { AutoScroller } from "@dnd-kit/dom";

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

function Board({
  tasks,
  setTasks,
  onEditTask,
  onDeleteTask,
}) {
  const [selectedTaskId, setSelectedTaskId] =
    useState(null);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ||
    null;

  const handleStatusChange = (taskId, status) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? { ...task, status }
          : task
      )
    );
  };

  const handleToggleSubtask = (
    taskId,
    subtaskId
  ) => {
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          subtasks: task.subtasks.map(
            (subtask) =>
              subtask.id === subtaskId
                ? {
                  ...subtask,
                  completed: !subtask.completed,
                }
                : subtask
          ),
        };
      })
    );
  };

  const handleDragEnd = (event) => {
    if (event.canceled) return;

    const { source, target } = event.operation;

    if (!source || !target) return;

    const sourceId = String(source.id);
    const targetId = String(target.id);

    if (!sourceId.startsWith("task:")) return;

    const taskId = sourceId.slice(5);
    const targetStatus = target.data?.status;

    if (
      !BOARD_COLUMNS.some(
        (column) => column.id === targetStatus
      )
    ) {
      return;
    }

    setTasks((previous) => {
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

      if (targetId.startsWith("column:")) {
        return appendToColumn();
      }

      if (targetId.startsWith("slot:")) {
        const targetIndex = target.data?.index;

        if (!Number.isInteger(targetIndex)) {
          return previous;
        }

        const columnTasks = remaining.filter(
          (task) => task.status === targetStatus
        );

        const originalColumnTasks = previous.filter(
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
          return appendToColumn();
        }

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

        return remaining;
      }

      return previous;
    });
  };

  const closeTaskDetails = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  return (
    <>
      <p className="mb-3 text-xs text-muted lg:hidden">
        Swipe horizontally to explore all board columns.
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
            {BOARD_COLUMNS.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.id
              );

              return (
                <BoardColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onTaskClick={(task) =>
                    setSelectedTaskId(task.id)
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Floating Drag Preview */}
        <DragOverlay
          dropAnimation={{
            duration: 150,
            easing: "ease-out",
          }}
        >
          {(source) => {
            const sourceId = String(source.id);

            if (!sourceId.startsWith("task:")) {
              return null;
            }

            const taskId = sourceId.slice(5);

            const task = tasks.find(
              (item) => item.id === taskId
            );

            if (!task) return null;

            const priority = task.priority || "medium";

            return (
              <div className="w-[290px] cursor-grabbing rounded-xl border-2 border-violet-500 bg-surface p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-md bg-violet-500/10 px-2 py-1 text-[11px] font-semibold capitalize text-accent">
                    {priority} priority
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
