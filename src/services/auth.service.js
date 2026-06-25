import API_URL from "./api";

const AUTH_EVENT = "auth-changed";

// Devuelve el payload del usuario autenticado (incluye rol, id, email, etc)
export function getUserFromToken() {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const payload = JSON.parse(decodeBase64Url(payloadPart));
    return payload;
  } catch {
    return null;
  }
}

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

export const getUserPermissions = () => {
  const payload = getTokenPayload(getAccessToken());
  return payload?.permisos || [];
};

export const getRolPlataforma = () => {
  const payload = getTokenPayload(getAccessToken());
  return payload?.rol_plataforma || null;
};

export const isCoordinador = () => {
  return getRolPlataforma() === 'coordinador';
};

export const isInstructorLider = () => {
  return getRolPlataforma() === 'instructor_lider';
};

// Función auxiliar para obtener el rol del usuario en un proyecto específico
const getUserRoleInProject = async (projectId) => {
  if (!projectId) {
    // Si no hay ID de proyecto, usar el rol global del token
    return getUserRoleFromToken();
  }

  try {
    const { obtenerMiRolEnProyecto } = await import('./proyectos.service.js');
    const roleData = await obtenerMiRolEnProyecto(projectId);
    return roleData?.rol || null;
  } catch (error) {
    console.error('Error al obtener rol en proyecto:', error);
    // Fallback al rol global
    return getUserRoleFromToken();
  }
};

// Función auxiliar para obtener los permisos del usuario en un proyecto específico
const getUserPermissionsInProject = async (projectId) => {
  if (!projectId) {
    // Si no hay ID de proyecto, usar los permisos globales del token
    return getUserPermissions();
  }

  try {
    const { obtenerMiRolEnProyecto } = await import('./proyectos.service.js');
    const roleData = await obtenerMiRolEnProyecto(projectId);
    return roleData?.permisos || [];
  } catch (error) {
    console.error('Error al obtener permisos en proyecto:', error);
    // Fallback a los permisos globales
    return getUserPermissions();
  }
};

export const canEditBacklog = async (projectId = null) => {
  const role = projectId ? await getUserRoleInProject(projectId) : getUserRoleFromToken();
  const permissions = projectId ? await getUserPermissionsInProject(projectId) : getUserPermissions();

  // Product Owner y Scrum Master pueden editar backlog
  if (role === 'Product Owner' || role === 'Scrum Master') {
    return true;
  }

  // Verificar si tiene el permiso editar_backlog
  return permissions.includes('editar_backlog');
};

export const canManageSprints = async (projectId = null) => {
  const role = projectId ? await getUserRoleInProject(projectId) : getUserRoleFromToken();
  const permissions = projectId ? await getUserPermissionsInProject(projectId) : getUserPermissions();

  // Product Owner y Scrum Master pueden gestionar sprints
  if (role === 'Product Owner' || role === 'Scrum Master') {
    return true;
  }

  // Verificar si tiene el permiso gestionar_sprints
  return permissions.includes('gestionar_sprints');
};

export const canMoveTasks = async (projectId = null) => {
  const role = projectId ? await getUserRoleInProject(projectId) : getUserRoleFromToken();
  const permissions = projectId ? await getUserPermissionsInProject(projectId) : getUserPermissions();

  // Developers pueden mover tareas
  if (role === 'Developer') {
    return true;
  }

  // Verificar si tiene el permiso mover_tareas
  return permissions.includes('mover_tareas');
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

const handleAuthResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Ocurrió un error en la autenticación");
    error.status = response.status;
    error.code = data.error || "AUTH_ERROR";
    error.details = data.details;
    throw error;
  }

  return data;
};

export async function login(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleAuthResponse(response);
}

export async function register(data) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleAuthResponse(response);
}
