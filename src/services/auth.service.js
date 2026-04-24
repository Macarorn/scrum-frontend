import API_URL from "./api";

const AUTH_EVENT = "auth-changed";

export function logout() {
  localStorage.removeItem("accessToken");
}
export const getAccessToken = () => {
  return localStorage.getItem("token");
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

export const setSessionTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem("token", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const clearSessionTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const subscribeAuthChanges = (callback) => {
  const handler = () => callback();
  window.addEventListener(AUTH_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(AUTH_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};

export const buildUnauthenticatedError = (
  message = "No autenticado. Por favor, inicia sesión",
) => {
  const error = new Error(message);
  error.code = "UNAUTHENTICATED";
  return error;
};

export const logoutSession = async () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  try {
    if (accessToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } finally {
    clearSessionTokens();
  }
};

export async function login(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}
