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

export const listarHistoriasPorEpica = async (idEpica) => {
  if (!idEpica) return [];

  return await fetchWithAuth(
    `/historias?id_epica=${idEpica}`,
    { method: "GET" },
    "No se pudieron cargar las historias",
  );
};

export const obtenerHistoria = async (idHistoria) => {
  if (!idHistoria) {
    throw new Error("Se requiere id de historia");
  }

  return await fetchWithAuth(
    `/historias/${idHistoria}`,
    { method: "GET" },
    "No se pudo cargar la historia",
  );
};

export const editarHistoria = async (idHistoria, payload) => {
  if (!idHistoria) {
    throw new Error("Se requiere id de historia");
  }

  return await fetchWithAuth(
    `/historias/${idHistoria}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "No se pudo editar la historia",
  );
};

export const toggleCriterioHistoria = async (idHistoria, idCriterio) => {
  if (!idHistoria || !idCriterio) {
    throw new Error("Se requieren ids de historia y criterio");
  }

  return await fetchWithAuth(
    `/historias/${idHistoria}/criterios/${idCriterio}`,
    { method: "PATCH" },
    "No se pudo actualizar el criterio",
  );
};
