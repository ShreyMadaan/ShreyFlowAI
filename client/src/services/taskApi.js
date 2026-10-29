
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const request = async (
  endpoint,
  token,
  options = {}
) => {
  const {
    body,
    headers,
    ...restOptions
  } = options;

  if (!token) {
    const error = new Error(
      "Please log in to access your tasks."
    );

    error.status = 401;
    throw error;
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...restOptions,
        headers: {
          ...(body !== undefined
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),
          Authorization:
            `Bearer ${token}`,
          ...headers,
        },
        ...(body !== undefined
          ? {
              body: JSON.stringify(body),
            }
          : {}),
      }
    );
  } catch {
    throw new Error(
      "Cannot connect to the server. Please check your connection."
    );
  }

  const result = await response
    .json()
    .catch(() => null);

  if (
    !response.ok ||
    result?.success === false
  ) {
    const error = new Error(
      result?.message ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;

    throw error;
  }

  return result?.data;
};

export const taskApi = {
  // GET /api/tasks
  getAll: (token) =>
    request("/tasks", token),

  // GET /api/tasks/:id
  getById: (token, id) =>
    request(
      `/tasks/${encodeURIComponent(id)}`,
      token
    ),

  // POST /api/tasks
  create: (token, taskData) =>
    request("/tasks", token, {
      method: "POST",
      body: taskData,
    }),

  // PATCH /api/tasks/:id
  update: (token, id, updates) =>
    request(
      `/tasks/${encodeURIComponent(id)}`,
      token,
      {
        method: "PATCH",
        body: updates,
      }
    ),

  // DELETE /api/tasks/:id
  delete: (token, id) =>
    request(
      `/tasks/${encodeURIComponent(id)}`,
      token,
      {
        method: "DELETE",
      }
    ),

  // PATCH /api/tasks/reorder
  reorder: (token, updates) =>
    request(
      "/tasks/reorder",
      token,
      {
        method: "PATCH",
        body: {
          updates,
        },
      }
    ),
};
