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

export const obtenerMetricasProyecto = async (proyectoId, sprintId = null) => {
  if (!proyectoId) return null;

  const response = await metricasApi.get(`/metricas/proyecto/${proyectoId}`, {
    params: sprintId ? { sprint: sprintId } : undefined,
  });

  return extractData(response);
};

export const obtenerMetricasSprint = async (proyectoId, sprintId) => {
  return obtenerMetricasProyecto(proyectoId, sprintId);
};

export const obtenerMetricasIntegrante = async (proyectoId, sprintId = null, integranteId = null) => {
  const metricas = await obtenerMetricasProyecto(proyectoId, sprintId);
  const miembros = Array.isArray(metricas?.teamMembers) ? metricas.teamMembers : [];

  if (!miembros.length) return null;

  if (integranteId) {
    return miembros.find(
      (miembro) =>
        String(miembro.id_usuario) === String(integranteId) ||
        String(miembro.usuario) === String(integranteId),
    );
  }

  return miembros[0];
};

export const exportarMetricas = async (proyectoId, sprintId = null) => {
  if (!proyectoId) return null;

  return metricasApi.get("/metricas/exportar", {
    params: sprintId ? { proyecto: proyectoId, sprint: sprintId } : { proyecto: proyectoId },
    responseType: "blob",
  });
};

export const obtenerSprintsProyecto = async (proyectoId) => {
  if (!proyectoId) return [];

  const response = await metricasApi.get(`/sprints`, {
    params: { id_proyecto: proyectoId },
  });

  return extractData(response);
};
