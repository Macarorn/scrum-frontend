const API_BASE_URL = "http://localhost:3000/api";

import {
  buildUnauthenticatedError,
  getAccessToken,
} from "./auth.service";

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
      descripcion: datos.descripcion,
      tipo: datos.tipo,
      estado: datos.estado,
      fecha_inicio: datos.fecha_inicio,
      fecha_fin_est: datos.fecha_fin_est,
      creado_por: userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    if (response.status === 401) {
      throw buildUnauthenticatedError(
        error.message || "No autenticado. Por favor, inicia sesión",
      );
    }

    throw new Error(error.message || "Error al crear proyecto");
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
    const error = await response.json();

    if (response.status === 401) {
      throw buildUnauthenticatedError(
        error.message || "No autenticado. Por favor, inicia sesión",
      );
    }

    throw new Error(error.message || "Error al cargar los proyectos");
  }

  return await response.json();
};
