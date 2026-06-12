import API_URL from "./api";
const API_BASE_URL = API_URL;
import { getAccessToken, buildUnauthenticatedError } from "./auth.service";

const fetchWithAuth = async (path, options = {}, fallbackMessage) => {
  const token = getAccessToken();
  if (!token) throw buildUnauthenticatedError();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(fallbackMessage);
  if (response.status === 204) return null;
  const payload = await response.json();
  return payload.data;
};

export const contarTareasPorHistoria = async (idHistoria) => {
  if (!idHistoria) return 0;
  const params = new URLSearchParams({ id_historia: idHistoria });
  const tareas = await fetchWithAuth(`/tareas?${params.toString()}`, { method: "GET" }, "No se pudieron cargar las tareas");
  return Array.isArray(tareas) ? tareas.length : 0;
};

export const listarTareasPorHistoria = async (idHistoria) => {
  if (!idHistoria) return [];
  const params = new URLSearchParams({ id_historia: idHistoria });
  return await fetchWithAuth(`/tareas?${params.toString()}`, { method: "GET" }, "No se pudieron cargar las tareas");
};

export const asignarUsuarioTarea = async (idTarea, idUsuario, esResponsable = false) => {
  if (!idTarea) {
    throw new Error("Se requiere id de tarea");
  }
  if (!idUsuario) {
    throw new Error("Se requiere id de usuario");
  }

  return await fetchWithAuth(
    `/tareas/${idTarea}/asignar`,
    {
      method: "POST",
      body: JSON.stringify({ id_usuario: idUsuario, es_responsable: esResponsable }),
    },
    "No se pudo asignar el usuario a la tarea",
  );
};

export const desasignarUsuarioTarea = async (idTarea, idUsuario) => {
  if (!idTarea) {
    throw new Error("Se requiere id de tarea");
  }
  if (!idUsuario) {
    throw new Error("Se requiere id de usuario");
  }

  return await fetchWithAuth(
    `/tareas/${idTarea}/asignar/${idUsuario}`,
    {
      method: "DELETE",
    },
    "No se pudo desasignar el usuario de la tarea",
  );
};

export const listarUsuariosAsignados = async (idTarea) => {
  if (!idTarea) {
    throw new Error("Se requiere id de tarea");
  }

  return await fetchWithAuth(
    `/tareas/${idTarea}/usuarios`,
    { method: "GET" },
    "No se pudieron cargar los usuarios asignados",
  );
};
