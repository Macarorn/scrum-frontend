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

// Listar proyectos del usuario
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

// Listar todos los proyectos
export const listarTodosProyectos = async () => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_BASE_URL}/proyectos/todos`, {
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

export const unirseProyecto = async (proyectoId) => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_BASE_URL}/proyectos/${proyectoId}/unirse`, {
    method: "POST",
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

    throw new Error(error.message || "Error al unirse al proyecto");
  }

  return await response.json();
};

// Buscar proyecto por código
export const buscarProyectoPorCodigo = async (codigo) => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_BASE_URL}/proyectos/codigo/${codigo}`, {
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

    throw new Error(error.message || "Proyecto no encontrado");
  }

  return await response.json();
};
