import API_URL from "./api";

const AUTH_EVENT = "auth-changed";

// Cache storage availability to avoid repeated access attempts that
// trigger browser "Tracking Prevention blocked access to storage" messages.
let _localStorageAvailable;
let _sessionStorageAvailable;

const checkStorageAvailable = (type = "localStorage") => {
  try {
    if (typeof window === "undefined") return false;

    if (type === "localStorage") {
      if (typeof _localStorageAvailable !== "undefined") return _localStorageAvailable;
      const testKey = "__scrum_storage_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      _localStorageAvailable = true;
      return true;
    }

    if (typeof _sessionStorageAvailable !== "undefined") return _sessionStorageAvailable;
    const testKey = "__scrum_storage_test__";
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
    _sessionStorageAvailable = true;
    return true;
  } catch (e) {
    if (type === "localStorage") _localStorageAvailable = false;
    else _sessionStorageAvailable = false;
    return false;
  }
};

const clearAppSessionCache = () => {
  if (checkStorageAvailable("localStorage")) {
    try {
      const localKeys = Object.keys(localStorage);
      localKeys.forEach((key) => {
        if (key.startsWith("scrum.")) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
  }

  if (checkStorageAvailable("sessionStorage")) {
    try {
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach((key) => {
        if (key.startsWith("scrum.")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
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
  try {
    if (!checkStorageAvailable("localStorage")) return null;
    const token = localStorage.getItem("token");

    if (!token) return null;

    if (isTokenExpired(token)) {
      clearSessionTokens();
      return null;
    }

    return token;
  } catch (err) {
    // Storage access blocked (tracking prevention / private mode)
    return null;
  }
};

export const hasValidSession = () => Boolean(getAccessToken());

export const getRefreshToken = () => {
  try {
    if (!checkStorageAvailable("localStorage")) return null;
    return localStorage.getItem("refreshToken");
  } catch (err) {
    return null;
  }
};

export const setSessionTokens = ({ accessToken, refreshToken }) => {
  try {
    if (checkStorageAvailable("localStorage")) {
      if (accessToken) {
        localStorage.setItem("token", accessToken);
      }

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    }
  } catch (err) {
    // Ignore storage write errors
  }

  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch (_) {}
};

export const clearSessionTokens = () => {
  try {
    if (checkStorageAvailable("localStorage")) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  } catch (err) {
    // ignore
  }

  try {
    clearAppSessionCache();
  } catch (_) {}

  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch (_) {}
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
