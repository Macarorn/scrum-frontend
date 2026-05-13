import API_URL from "./api";

const AUTH_EVENT = "auth-changed";

const clearAppSessionCache = () => {
  try {
    const localKeys = Object.keys(localStorage);
    localKeys.forEach((key) => {
      if (key.startsWith("scrum.")) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore storage failures (private mode / denied access)
  }

  try {
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach((key) => {
      if (key.startsWith("scrum.")) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore storage failures (private mode / denied access)
  }
};

export function logout() {
  clearSessionTokens();
}

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return atob(padded);
};

export const getTokenPayload = (token) => {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1] || "";
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (token) => {
  const payload = getTokenPayload(token || getAccessToken());
  return payload?.id_usuario || payload?.id || payload?.userId || null;
};

export const getUserRoleFromToken = (token) => {
  const payload = getTokenPayload(token || getAccessToken());
  return payload?.rol || payload?.rol_principal || "";
};

const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) {
      return true;
    }

    const payload = JSON.parse(decodeBase64Url(payloadPart));

    if (!payload.exp) {
      return true;
    }

    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const getAccessToken = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    clearSessionTokens();
    return null;
  }

  return token;
};

export const hasValidSession = () => Boolean(getAccessToken());

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
  clearAppSessionCache();
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "No se pudo refrescar el token");
    }

    const accessToken = data.data?.accessToken || data.data?.token;
    const newRefreshToken = data.data?.refreshToken || refreshToken;
    if (accessToken) {
      setSessionTokens({ accessToken, refreshToken: newRefreshToken });
      return accessToken;
    }
  } catch {
    clearSessionTokens();
  }

  return null;
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
