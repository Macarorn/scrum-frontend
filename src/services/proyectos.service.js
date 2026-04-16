const API_BASE_URL = "http://localhost:3000/api";

import {
  buildUnauthenticatedError,
  getAccessToken,
} from "./auth.service";

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

const getUserIdFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id_usuario || null;
  } catch {
    return null;
  }
};

// Crear proyecto
export const crearProyecto = async (datos) => {
  const token = getAccessToken();
  const userId = getUserIdFromToken(token);

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_BASE_URL}/proyectos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      nombre: datos.nombre,
      tipo: datos.tipo,
      max_integrantes: datos.numIntegrantes,
      creado_por: userId,
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al crear proyecto");

    if (response.status === 401) {
      throw buildUnauthenticatedError(
        errorMessage || "No autenticado. Por favor, inicia sesión",
      );
    }

    throw new Error(errorMessage);
  }

  return await response.json();
};

// Listar proyectos
export const listarProyectos = async () => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_BASE_URL}/proyectos`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al cargar los proyectos");

    if (response.status === 401) {
      throw buildUnauthenticatedError(
        errorMessage || "No autenticado. Por favor, inicia sesión",
      );
    }

    throw new Error(errorMessage);
  }

  return await response.json();
};
