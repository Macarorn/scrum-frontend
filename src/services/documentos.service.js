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

const getAuthHeaders = (isFormData = false) => {
  const token = getAccessToken();
  if (!token) throw buildUnauthenticatedError();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Listar todos los documentos de un proyecto
export const listarDocumentos = async (proyectoId) => {
  const response = await fetch(`${API_URL}/proyectos/${proyectoId}/documentos`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al cargar los documentos");
    if (response.status === 401) throw buildUnauthenticatedError(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
};

// Subir un nuevo documento
export const subirDocumento = async (proyectoId, file, nombre, comentario) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("nombre", nombre);
  if (comentario) formData.append("comentario", comentario);

  const response = await fetch(`${API_URL}/proyectos/${proyectoId}/documentos`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: formData,
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al subir el documento");
    if (response.status === 401) throw buildUnauthenticatedError(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
};

// Subir nueva versión
export const actualizarDocumento = async (proyectoId, documentoId, file, comentario) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("comentario", comentario);

  const response = await fetch(`${API_URL}/proyectos/${proyectoId}/documentos/${documentoId}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: formData,
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al actualizar el documento");
    if (response.status === 401) throw buildUnauthenticatedError(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
};

// Desactivar un documento
export const desactivarDocumento = async (proyectoId, documentoId) => {
  const response = await fetch(`${API_URL}/proyectos/${proyectoId}/documentos/${documentoId}/desactivar`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al desactivar el documento");
    if (response.status === 401) throw buildUnauthenticatedError(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
};

// Obtener historial
export const obtenerHistorial = async (proyectoId, documentoId) => {
  const response = await fetch(`${API_URL}/proyectos/${proyectoId}/documentos/${documentoId}/historial`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al cargar el historial");
    if (response.status === 401) throw buildUnauthenticatedError(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
};

// Obtener URL de descarga
export const obtenerUrlDescarga = async (proyectoId, documentoId, version = null) => {
  const queryParam = version ? `?version=${version}` : "";
  const response = await fetch(`${API_URL}/proyectos/${proyectoId}/documentos/${documentoId}/descargar${queryParam}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, "Error al obtener link de descarga");
    if (response.status === 401) throw buildUnauthenticatedError(errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.data;
};
