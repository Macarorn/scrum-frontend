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

export const listarEpicasPorProyecto = async (idProyecto) => {
  if (!idProyecto) return [];

  return await fetchWithAuth(
    `/epicas?id_proyecto=${idProyecto}`,
    { method: "GET" },
    "No se pudieron cargar las epicas",
  );
};

export const obtenerEpica = async (idEpica) => {
  if (!idEpica) {
    throw new Error("Se requiere id de epica");
  }

  return await fetchWithAuth(
    `/epicas/${idEpica}`,
    { method: "GET" },
    "No se pudo cargar la epica",
  );
};

export const crearEpica = async (payload) => {
  return await fetchWithAuth(
    "/epicas",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "No se pudo crear la epica",
  );
};

export const editarEpica = async (idEpica, payload) => {
  if (!idEpica) {
    throw new Error("Se requiere id de epica");
  }

  return await fetchWithAuth(
    `/epicas/${idEpica}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "No se pudo editar la epica",
  );
};

export const eliminarEpica = async (idEpica) => {
  if (!idEpica) {
    throw new Error("Se requiere id de epica");
  }

  return await fetchWithAuth(
    `/epicas/${idEpica}`,
    { method: "DELETE" },
    "No se pudo borrar la epica",
  );
};
