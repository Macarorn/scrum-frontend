import API_URL from "./api";
const API_BASE_URL = API_URL;

import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

const ESTADO_LABELS = {
  por_hacer: "Por Hacer",
  en_progreso: "En Progreso",
  bloqueado: "En Revisión",
  terminado: "Terminado",
};

const estadoLabel = (estado) => ESTADO_LABELS[estado] || estado || "desconocido";

const parseError = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (body.error === "INVALID_TRANSITION") {
      const actual = estadoLabel(body?.details?.estadoActual);
      const siguiente = estadoLabel(body?.details?.nuevoEstado);
      if (body?.details?.estadoActual === "bloqueado" && body?.details?.nuevoEstado === "terminado") {
        return "No puedes pasar una tarea de En Revisión a Terminado. Primero cámbiala a En Progreso y luego a Terminado.";
      }
      if (body?.details?.estadoActual === "en_progreso" && body?.details?.nuevoEstado === "por_hacer") {
        return "No se puede mover la tarea de En Progreso a Por Hacer. Solo puedes moverla a Terminado o En Revisión. Si necesitas reabrirla, primero pásala a En Revisión.";
      }
      if (body?.details?.estadoActual === "por_hacer" && body?.details?.nuevoEstado === "terminado") {
        return "No puedes pasar una tarea directamente de Por Hacer a Terminado. Debe pasar primero por En Progreso.";
      }
      return `No se puede mover la tarea de ${actual} a ${siguiente}. Revisa el flujo permitido del tablero.`;
    }

    if (body.error === "FORBIDDEN") {
      return "No tienes permiso para cambiar el estado de esta tarea. Verifica que tengas acceso al proyecto.";
    }

    if (Array.isArray(body.details) && body.details.length > 0) {
      return body.details.join(". ");
    }

    if (
      body.details &&
      typeof body.details === "object" &&
      typeof body.details.reason === "string" &&
      body.details.reason.trim()
    ) {
      return body.details.reason;
    }

    return body.message || body.error || fallbackMessage;
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

export const crearSprint = async (payload) => {
  return await fetchWithAuth(
    "/sprints",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "No se pudo crear el sprint",
  );
};

export const obtenerSprintPorId = async (idSprint) => {
  if (!idSprint) {
    throw new Error("Se requiere id de sprint");
  }

  return await fetchWithAuth(
    `/sprints/${idSprint}`,
    { method: "GET" },
    "No se pudo cargar el detalle del sprint",
  );
};

export const actualizarSprint = async (idSprint, payload) => {
  if (!idSprint) {
    throw new Error("Se requiere id de sprint");
  }

  await fetchWithAuth(
    `/sprints/${idSprint}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "No se pudo actualizar el sprint",
  );

  return await obtenerSprintPorId(idSprint);
};

export const eliminarSprint = async (idSprint) => {
  if (!idSprint) {
    throw new Error("Se requiere id de sprint");
  }

  return await fetchWithAuth(
    `/sprints/${idSprint}`,
    { method: "DELETE" },
    "No se pudo eliminar el sprint",
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
