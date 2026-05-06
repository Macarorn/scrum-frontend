import API_URL from "./api";
import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

const parseError = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    return body.message || body.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const request = async (path, options = {}, fallbackMessage) => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, fallbackMessage);

    if (response.status === 401) {
      throw buildUnauthenticatedError(errorMessage);
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

export const listarNotificaciones = async () => {
  return request("/notificaciones", {}, "Error al cargar las notificaciones");
};

export const marcarNotificacionComoLeida = async (idNotificacion) => {
  return request(
    `/notificaciones/${idNotificacion}/leida`,
    { method: "POST" },
    "Error al marcar la notificación como leída",
  );
};
