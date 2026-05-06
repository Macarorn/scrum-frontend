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
  if (filters.sprint) query.push(`sprint=${encodeURIComponent(filters.sprint)}`);
  if (filters.from) query.push(`from=${encodeURIComponent(filters.from)}`);
  if (filters.to) query.push(`to=${encodeURIComponent(filters.to)}`);
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
