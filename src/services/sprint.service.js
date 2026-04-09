const API_BASE_URL = "http://localhost:3000/api";

import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

const parseError = async (response, fallbackMessage) => {
  try {
    const body = await response.json();
    return body.error || body.message || fallbackMessage;
  } catch {
    return fallbackMessage;
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
