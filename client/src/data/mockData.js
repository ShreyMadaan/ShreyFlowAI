
export const BOARD_COLUMNS = [
  {
    id: "backlog",
    title: "Backlog",
    color: "#94a3b8",
  },
  {
    id: "todo",
    title: "To Do",
    color: "#818cf8",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "#f59e0b",
  },
  {
    id: "review",
    title: "Review",
    color: "#a78bfa",
  },
  {
    id: "done",
    title: "Done",
    color: "#10b981",
  },
];

export const INITIAL_TASKS = [
  {
    id: "task-1",
    title: "Design dashboard wireframes",
    description:
      "Create responsive dashboard layouts for desktop and mobile.",
    status: "done",
    priority: "high",
    labels: ["Design", "UI/UX"],
    dueDate: "2026-11-02",
    subtasks: [
      { id: "sub-1", title: "Desktop layout", completed: true },
      { id: "sub-2", title: "Mobile layout", completed: true },
    ],
  },
  {
    id: "task-2",
    title: "Build reusable Kanban components",
    description:
      "Create modular columns and task cards with theme support.",
    status: "in-progress",
    priority: "high",
    labels: ["Frontend", "React"],
    dueDate: "2026-11-05",
    subtasks: [
      { id: "sub-3", title: "Board component", completed: true },
      { id: "sub-4", title: "Task card component", completed: false },
      { id: "sub-5", title: "Responsive styling", completed: false },
    ],
  },
  {
    id: "task-3",
    title: "Create task management API",
    description:
      "Implement Express controllers for creating and managing tasks.",
    status: "todo",
    priority: "high",
    labels: ["Backend", "API"],
    dueDate: "2026-11-09",
    subtasks: [],
  },
  {
    id: "task-4",
    title: "Plan AI task breakdown feature",
    description:
      "Define prompts and expected output for AI-generated task plans.",
    status: "backlog",
    priority: "medium",
    labels: ["AI", "Planning"],
    dueDate: "2026-11-14",
    subtasks: [],
  },
  {
    id: "task-5",
    title: "Review dashboard accessibility",
    description:
      "Check keyboard navigation, contrast, and responsive behavior.",
    status: "review",
    priority: "medium",
    labels: ["Testing", "Accessibility"],
    dueDate: "2026-11-07",
    subtasks: [
      { id: "sub-6", title: "Keyboard audit", completed: true },
      { id: "sub-7", title: "Contrast audit", completed: false },
    ],
  },
  {
    id: "task-6",
    title: "Set up project repository",
    description:
      "Initialize React, Express, and Git project structure.",
    status: "done",
    priority: "low",
    labels: ["Setup"],
    dueDate: "2026-10-24",
    subtasks: [],
  },
];
