const API_BASE_URL = "http://localhost:3000/api";

import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

const parseError = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (Array.isArray(body.details) && body.details.length > 0) {
      return body.details.join(". ");
    }

    return body.error || body.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const decodeJwtPayload = (token) => {
  const payload = token.split(".")[1] || "";
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return JSON.parse(atob(padded));
};

const getUserIdFromToken = (token) => {
  try {
    const payload = decodeJwtPayload(token);
    return payload?.id_usuario || payload?.id || payload?.userId || null;
  } catch {
    return null;
  }
};

const fetchWithAuth = async (path, options = {}, fallbackMessage) => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw buildUnauthenticatedError();
    }

    throw new Error(await parseError(response, fallbackMessage));
  }

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();
  return payload.data;
};

export const listarSprintsPorProyecto = async (idProyecto) => {
  if (!idProyecto) return [];

  return await fetchWithAuth(
    `/sprints?id_proyecto=${idProyecto}`,
    { method: "GET" },
    "No se pudieron cargar los sprints",
  );
};

export const obtenerTareasPorSprint = async (idSprint) => {
  if (!idSprint) return [];

  return await fetchWithAuth(
    `/tareas?id_sprint=${idSprint}`,
    { method: "GET" },
    "No se pudieron cargar las tareas del sprint",
  );
};

export const cambiarEstadoTarea = async (idTarea, estado) => {
  if (!idTarea) {
    throw new Error("Se requiere id de tarea");
  }

  return await fetchWithAuth(
    `/tareas/${idTarea}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    },
    "No se pudo actualizar el estado de la tarea",
  );
};

export const crearTarea = async (payload) => {
  const token = getAccessToken();
  const userId = Number(getUserIdFromToken(token));

  if (!token) {
    throw buildUnauthenticatedError();
  }

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("No se pudo identificar el usuario autenticado");
  }

  const responsibleId = Number(payload.id_usuario_responsable || userId);
  if (!Number.isInteger(responsibleId) || responsibleId <= 0) {
    throw new Error("No se pudo identificar un responsable valido para la tarea");
  }

  const response = await fetch(`${API_BASE_URL}/tareas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      id_usuario_responsable: responsibleId,
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "No se pudo crear la tarea");

    if (response.status === 401) {
      throw buildUnauthenticatedError(
        errorMessage || "No autenticado. Por favor, inicia sesión",
      );
    }

    throw new Error(errorMessage);
  }

  return await response.json();
};

export const obtenerDetalleTarea = async (idTarea) => {
  if (!idTarea) {
    throw new Error("Se requiere id de tarea");
  }

  return await fetchWithAuth(
    `/tareas/${idTarea}`,
    { method: "GET" },
    "No se pudo cargar el detalle de la tarea",
  );
};

export const editarTarea = async (idTarea, payload) => {
  if (!idTarea) {
    throw new Error("Se requiere id de tarea");
  }

  return await fetchWithAuth(
    `/tareas/${idTarea}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "No se pudo editar la tarea",
  );
};

export const eliminarTarea = async (idTarea) => {
  if (!idTarea) {
    throw new Error("Se requiere id de tarea");
  }

  return await fetchWithAuth(
    `/tareas/${idTarea}`,
    { method: "DELETE" },
    "No se pudo borrar la tarea",
  );
};
