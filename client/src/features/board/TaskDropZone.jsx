
import { useDroppable } from "@dnd-kit/react";

function TaskDropZone({ columnId, index }) {
  const { ref, isDropTarget } = useDroppable({
    id: `slot:${columnId}:${index}`,
    data: {
      status: columnId,
      index,
    },
  });

  return (
    <div
      ref={ref}
      aria-label={`Drop position ${index + 1}`}
      className={`
        -my-1 flex h-5 shrink-0 items-center
        rounded-md transition-colors
        ${
          isDropTarget
            ? "bg-violet-500/20"
            : "bg-transparent"
        }
      `}
    >
      <div
        className={`h-1 w-full rounded-full ${
          isDropTarget
            ? "bg-violet-500"
            : "bg-transparent"
        }`}
      />
    </div>
  );
}

export default TaskDropZone;
