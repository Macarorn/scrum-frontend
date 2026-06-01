const API_BASE_URL = "http://localhost:3000/api";

import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

const parseError = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (body.details && Array.isArray(body.details)) {
      return body.details.join(". ") || fallbackMessage;
    }

    return body.message || body.error || fallbackMessage;
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

export const listarMeetings = async (filters = {}) => {
  const query = [];
  if (filters.q) query.push(`q=${encodeURIComponent(filters.q)}`);
  if (filters.id_proyecto) query.push(`id_proyecto=${encodeURIComponent(filters.id_proyecto)}`);
  if (filters.sprint) query.push(`sprint=${encodeURIComponent(filters.sprint)}`);
  if (filters.from) query.push(`from=${encodeURIComponent(filters.from)}`);
  if (filters.to) query.push(`to=${encodeURIComponent(filters.to)}`);
  // Si se especifica id_proyecto, usar endpoint por proyecto para evitar mezclar datos
  if (filters.id_proyecto) {
    const id = encodeURIComponent(filters.id_proyecto);
    const qs = query.length ? `?${query.join("&")}` : "";
    const path = `/meetings/project/${id}${qs}`;
    return await fetchWithAuth(path, { method: "GET" }, "No se pudieron cargar las reuniones del proyecto");
  }

  const path = `/meetings${query.length ? `?${query.join("&")}` : ""}`;
  return await fetchWithAuth(path, { method: "GET" }, "No se pudieron cargar las reuniones");
};

export const crearMeeting = async (payload) => {
  return await fetchWithAuth(
    "/meetings",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "No se pudo crear la reunión",
  );
};

export const actualizarMeeting = async (id, payload) => {
  return await fetchWithAuth(
    `/meetings/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "No se pudo actualizar la reunión",
  );
};

export const eliminarMeeting = async (id) => {
  return await fetchWithAuth(
    `/meetings/${id}`,
    {
      method: "DELETE",
    },
    "No se pudo eliminar la reunión",
  );
};
