const API_BASE_URL = "http://localhost:3000/api";

import {
  buildUnauthenticatedError,
  getAccessToken,
  getUserIdFromToken,
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

// Cache para evitar llamadas idénticas durante la sesión
let proyectosCache = null;
const roleCache = new Map();

export const clearProyectosCache = () => {
  proyectosCache = null;
};

export const clearRoleCache = () => {
  roleCache.clear();
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
      estado: "activo", // Siempre crear como activo
      fecha_inicio: datos.fecha_inicio,
      fecha_fin_est: datos.fecha_fin_est,
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

// Listar proyectos del usuario
export const listarProyectos = async () => {
  if (proyectosCache) return proyectosCache;

  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  proyectosCache = (async () => {
    const response = await fetch(`${API_BASE_URL}/proyectos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorMessage = await parseError(
        response,
        "Error al cargar los proyectos",
      );

      if (response.status === 401) {
        proyectosCache = null;
        throw buildUnauthenticatedError(
          errorMessage || "No autenticado. Por favor, inicia sesión",
        );
      }

      proyectosCache = null;
      throw new Error(errorMessage);
    }

    const json = await response.json();
    return json;
  })();

  return proyectosCache;
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

  const response = await fetch(
    `${API_BASE_URL}/proyectos/${proyectoId}/unirse`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

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

// Obtener el rol del usuario en un proyecto específico
export const obtenerMiRolEnProyecto = async (proyectoId) => {
  if (!proyectoId) return null;

  if (roleCache.has(String(proyectoId))) {
    return roleCache.get(String(proyectoId));
  }

  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_BASE_URL}/proyectos/${proyectoId}/mi-rol`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await parseError(
      response,
      "Error al obtener rol en proyecto",
    );

    if (response.status === 401) {
      throw buildUnauthenticatedError(
        errorMessage || "No autenticado. Por favor, inicia sesión",
      );
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  const data = result.data;
  try {
    roleCache.set(String(proyectoId), data);
  } catch {
    // ignore caching failures
  }

  return data;
};
