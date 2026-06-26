import axios from "axios";
import API_URL from "./api";
import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

const metricasApi = axios.create({
  baseURL: API_URL,
});

metricasApi.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const extractData = (response) => response.data?.data ?? response.data ?? [];

export const getMetricasProyecto = async (proyectoId, sprintId) => {
  if (!proyectoId) return null;

  console.log("[metricas][dashboard-service] Proyecto seleccionado:", proyectoId);
  console.log("[metricas][dashboard-service] Sprint seleccionado:", sprintId);

  const params = sprintId ? { id_sprint: sprintId } : undefined;
  const response = await metricasApi.get(`/metricas/proyecto/${proyectoId}`, {
    params,
  });
  return extractData(response);
};

export const listarTareasMetricas = async () => {
  const response = await metricasApi.get("/tareas");
  return extractData(response);
};

export const listarEpicasMetricas = async (proyectoId) => {
  const response = await metricasApi.get("/epicas", {
    params: proyectoId ? { proyectoId } : undefined,
  });
  return extractData(response);
};

export const listarHistoriasMetricas = async () => {
  const response = await metricasApi.get("/historias");
  return extractData(response);
};

export const listarMiembrosMetricas = async (proyectoId) => {
  if (!proyectoId) return [];

  const response = await metricasApi.get(`/proyectos/${proyectoId}/miembros`);
  return extractData(response);
};
