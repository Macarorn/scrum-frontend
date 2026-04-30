const API_BASE_URL = "http://localhost:3000/api";
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
  const tareas = await fetchWithAuth(`/tareas?id_historia=${idHistoria}`, { method: "GET" }, "No se pudieron cargar las tareas");
  return Array.isArray(tareas) ? tareas.length : 0;
};
