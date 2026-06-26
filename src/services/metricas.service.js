import API_URL from "./api";
import { getAccessToken, buildUnauthenticatedError } from "./auth.service";

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

export const obtenerMetricasProyecto = async (proyectoId) => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_URL}/metricas/proyecto/${proyectoId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al cargar las métricas");

    if (response.status === 401) {
      throw buildUnauthenticatedError(
        errorMessage || "No autenticado. Por favor, inicia sesión",
      );
    }

    throw new Error(errorMessage);
  }

  const payload = await response.json();
  return payload.data;
};
