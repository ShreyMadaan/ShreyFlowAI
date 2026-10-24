
import { useCallback, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";

import { BOARD_COLUMNS } from "../../data/mockData";

import BoardColumn from "./BoardColumn";
import TaskDetailsModal from "../tasks/TaskDetailsModal";

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

      // Drop on column background: append to column.
      if (targetId.startsWith("column:")) {
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
      }

      // Drop on a position between task cards.
      if (targetId.startsWith("slot:")) {
        const targetIndex = target.data?.index;

        if (!Number.isInteger(targetIndex)) {
          return previous;
        }

        const columnTasks = remaining.filter(
          (task) => task.status === targetStatus
        );

        const safeIndex = Math.max(
          0,
          Math.min(targetIndex, columnTasks.length)
        );

        if (safeIndex === columnTasks.length) {
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
        }

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
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
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
