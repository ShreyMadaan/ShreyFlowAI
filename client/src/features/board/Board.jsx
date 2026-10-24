
import { useCallback, useState } from "react";

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

  const closeTaskDetails = useCallback(() => {
    setSelectedTaskId(null);
  }, []);

  return (
    <>
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
