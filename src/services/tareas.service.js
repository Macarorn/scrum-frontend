import { getAccessToken, buildUnauthenticatedError } from "./auth.service";

const API_BASE_URL = "http://localhost:3000/api";
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
