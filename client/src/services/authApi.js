
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const request = async (endpoint, options = {}) => {
  const { body, token, ...restOptions } = options;

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
          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
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

export const authApi = {
  register: ({ name, email, password }) =>
    request("/auth/register", {
      method: "POST",
      body: {
        name,
        email,
        password,
      },
    }),

  login: ({ email, password }) =>
    request("/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
    }),

  me: (token) =>
    request("/auth/me", {
      token,
    }),
};
