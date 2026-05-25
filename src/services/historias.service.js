import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

const API_BASE_URL = "http://localhost:3000/api";

const parseError = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };
    if (Array.isArray(body.details) && body.details.length > 0) {
      return body.details.join(". ");
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

export const listarHistoriasPorEpica = async (idEpica) => {
  if (!idEpica) return [];

  return await fetchWithAuth(
    `/historias?epicaId=${idEpica}`,
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

export const crearHistoria = async (payload) => {
  return await fetchWithAuth(
    "/historias",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "No se pudo crear la historia",
  );
};

export const actualizarHistoria = async (idHistoria, payload) => {
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

export const listarCriteriosHistoria = async (idHistoria) => {
  if (!idHistoria) {
    throw new Error("Se requiere id de historia");
  }

  return await fetchWithAuth(
    `/historias/${idHistoria}/criterios`,
    { method: "GET" },
    "No se pudieron cargar los criterios",
  );
};

export const crearCriterioHistoria = async (idHistoria, descripcion) => {
  if (!idHistoria) {
    throw new Error("Se requiere id de historia");
  }

  return await fetchWithAuth(
    `/historias/${idHistoria}/criterios`,
    {
      method: "POST",
      body: JSON.stringify({ descripcion }),
    },
    "No se pudo crear el criterio",
  );
};

export const editarCriterioHistoria = async (idCriterio, descripcion) => {
  if (!idCriterio) {
    throw new Error("Se requiere id de criterio");
  }

  return await fetchWithAuth(
    `/criterios/${idCriterio}`,
    {
      method: "PUT",
      body: JSON.stringify({ descripcion }),
    },
    "No se pudo editar el criterio",
  );
};

export const eliminarCriterioHistoria = async (idCriterio) => {
  if (!idCriterio) {
    throw new Error("Se requiere id de criterio");
  }

  return await fetchWithAuth(
    `/criterios/${idCriterio}`,
    {
      method: "DELETE",
    },
    "No se pudo eliminar el criterio",
  );
};

export const editarHistoria = actualizarHistoria;

export const eliminarHistoria = async (idHistoria) => {
  if (!idHistoria) {
    throw new Error("Se requiere id de historia");
  }

  return await fetchWithAuth(
    `/historias/${idHistoria}`,
    { method: "DELETE" },
    "No se pudo eliminar la historia",
  );
};
