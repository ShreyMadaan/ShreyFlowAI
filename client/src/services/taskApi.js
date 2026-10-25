
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const request = async (endpoint, options = {}) => {
  const { body, headers, ...restOptions } = options;

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...restOptions,
        headers: {
          ...(body !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
          ...headers,
        },
        ...(body !== undefined
          ? { body: JSON.stringify(body) }
          : {}),
      }
    );
  } catch {
    throw new Error(
      "Cannot connect to the server. Please check your connection."
    );
  }

  const result = await response.json().catch(
    () => null
  );

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return result?.data;
};

export const taskApi = {
  // GET /api/tasks
  getAll: () => request("/tasks"),

  // GET /api/tasks/:id
  getById: (id) =>
    request(`/tasks/${encodeURIComponent(id)}`),

  // POST /api/tasks
  create: (taskData) =>
    request("/tasks", {
      method: "POST",
      body: taskData,
    }),

  // PATCH /api/tasks/:id
  update: (id, updates) =>
    request(
      `/tasks/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: updates,
      }
    ),

  // DELETE /api/tasks/:id
  delete: (id) =>
    request(
      `/tasks/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      }
    ),

  // PATCH /api/tasks/reorder
  reorder: (updates) =>
    request("/tasks/reorder", {
      method: "PATCH",
      body: { updates },
    }),
};
