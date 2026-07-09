import { useCallback, useMemo, useState } from "react";
import { getMetricasProyecto } from "../services/metricas-dashboard.service";

// CAMBIAR A 'false' PARA USAR DATOS REALES DE LA BASE DE DATOS
const USE_MOCK_DATA = false;

const MOCK_DATA = {
  kpis: {
    backlogProgress: 75,
    totalBacklog: 40,
    completedBacklog: 30,
    completedEpics: 2,
    pendingEpics: 1,
    totalEpics: 3,
    completedEpicsPercent: 66,
    pendingEpicsPercent: 33,
    totalStories: 15,
    completedStories: 10,
    inProgressStories: 5,
    completedTasks: 30,
    pendingTasks: 10,
    todoTasks: 5,
    inProgressTasks: 5,
  },
  projectProgress: {
    percent: 65,
    completed: 65,
    pending: 35,
    total: 100,
    data: [{ value: 65 }, { value: 35 }]
  },
  taskStatus: {
    total: 100,
    data: [
      { name: "Por hacer", value: 15, percent: 15 },
      { name: "En progreso", value: 20, percent: 20 },
      { name: "Terminadas", value: 65, percent: 65 }
    ]
  },
  backlogStatus: {
    total: 40,
    completed: 30,
    pending: 10,
    percent: 75,
    donutData: [{ value: 30 }, { value: 10 }]
  },
  epicStatus: {
    total: 3,
    active: 1,
    completed: 2,
    pending: 0,
    percent: 66,
    data: [{ name: "Completadas", value: 2 }, { name: "Pendientes", value: 1 }],
    epics: [
      { name: "Autenticación", progress: 100, status: "completada" },
      { name: "Dashboard", progress: 60, status: "en progreso" },
      { name: "Reportes", progress: 0, status: "pendiente" }
    ]
  },
  teamMembers: [
    { nombre: "Juan Pérez", rol: "Desarrollador", tareasAsignadas: 10, tareasCompletadas: 8, tareasEnProgreso: 2, productividad: 80, initials: "JP", bg: "#7C4DFF" },
    { nombre: "Ana Gómez", rol: "Desarrollador", tareasAsignadas: 12, tareasCompletadas: 6, tareasEnProgreso: 4, tareasPorHacer: 2, productividad: 50, initials: "AG", bg: "#FF8A26" },
    { nombre: "Carlos Ruiz", rol: "QA", tareasAsignadas: 8, tareasCompletadas: 7, tareasEnProgreso: 1, productividad: 87, initials: "CR", bg: "#39A900" }
  ],
  epicas: [
    { nombre: "Autenticación", estado: "completada", progreso: 100, tareas: 10 },
    { nombre: "Dashboard", estado: "en progreso", progreso: 60, tareas: 15 },
    { nombre: "Reportes", estado: "pendiente", progreso: 0, tareas: 5 }
  ],
  historias: [
    { nombre: "Login de usuario", estado: "completada", prioridad: "alta", epica: "Autenticación" },
    { nombre: "Recuperar contraseña", estado: "completada", prioridad: "media", epica: "Autenticación" },
    { nombre: "Ver métricas generales", estado: "en progreso", prioridad: "alta", epica: "Dashboard" }
  ],
  tareas: [
    { nombre: "Crear endpoint de login", estado: "completada", responsable: "Juan Pérez", historia: "Login de usuario" },
    { nombre: "Diseñar UI del dashboard", estado: "completada", responsable: "Ana Gómez", historia: "Ver métricas generales" },
    { nombre: "Implementar gráficos", estado: "en progreso", responsable: "Juan Pérez", historia: "Ver métricas generales" }
  ]
};

const initialDashboardData = {
  kpis: null,
  projectProgress: null,
  taskStatus: null,
  teamMembers: null,
  backlog: null,
  backlogStatus: null,
  epicStatus: null,
  tareas: null,
  epicas: null,
  historias: null,
  usuarios: null,
};

const safeNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const safePercent = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const normalizeChartData = (data, fallback) => {
  if (Array.isArray(data) && data.length) return data;
  return fallback;
};

const normalizeMetricasData = (metricas) => {
  if (!metricas || typeof metricas !== "object") {
    return initialDashboardData;
  }

  const kpis = metricas.kpis || {};
  const projectProgress = metricas.projectProgress || {};
  const taskStatus = metricas.taskStatus || {};
  const backlogStatus = metricas.backlogStatus || {};
  const epicStatus = metricas.epicStatus || {};
  const teamMembers = Array.isArray(metricas.teamMembers)
    ? metricas.teamMembers
    : Array.isArray(metricas.usuarios)
    ? metricas.usuarios
    : [];

  return {
    ...metricas,
    kpis: {
      backlogProgress: safePercent(kpis.backlogProgress ?? 0),
      totalBacklog: safeNumber(kpis.totalBacklog ?? 0),
      completedBacklog: safeNumber(kpis.completedBacklog ?? 0),
      completedEpics: safeNumber(kpis.completedEpics ?? 0),
      pendingEpics: safeNumber(kpis.pendingEpics ?? 0),
      totalEpics: safeNumber(kpis.totalEpics ?? 0),
      completedEpicsPercent: safePercent(kpis.completedEpicsPercent ?? 0),
      pendingEpicsPercent: safePercent(kpis.pendingEpicsPercent ?? 0),
      totalStories: safeNumber(kpis.totalStories ?? 0),
      completedStories: safeNumber(kpis.completedStories ?? 0),
      inProgressStories: safeNumber(kpis.inProgressStories ?? 0),
      completedTasks: safeNumber(kpis.completedTasks ?? 0),
      pendingTasks: safeNumber(kpis.pendingTasks ?? 0),
      todoTasks: safeNumber(kpis.todoTasks ?? 0),
      inProgressTasks: safeNumber(kpis.inProgressTasks ?? 0),
    },
    projectProgress: {
      percent: safePercent(projectProgress.percent ?? 0),
      completed: safeNumber(projectProgress.completed ?? 0),
      pending: safeNumber(projectProgress.pending ?? 0),
      total: safeNumber(projectProgress.total ?? 0),
      data: normalizeChartData(projectProgress.data, [
        { value: safeNumber(projectProgress.completed ?? 0) },
        { value: safeNumber(projectProgress.pending ?? 0) || 1 },
      ]),
    },
    taskStatus: {
      total: safeNumber(taskStatus.total ?? 0),
      data: normalizeChartData(taskStatus.data, [
        { name: "Por hacer", value: safeNumber(taskStatus.data?.[0]?.value ?? 0), percent: safePercent(taskStatus.data?.[0]?.percent ?? 0), color: "#2F80ED" },
        { name: "En progreso", value: safeNumber(taskStatus.data?.[1]?.value ?? 0), percent: safePercent(taskStatus.data?.[1]?.percent ?? 0), color: "#FF8A26" },
        { name: "Terminadas", value: safeNumber(taskStatus.data?.[2]?.value ?? 0), percent: safePercent(taskStatus.data?.[2]?.percent ?? 0), color: "#39A900" },
      ]),
    },
    backlogStatus: {
      total: safeNumber(backlogStatus.total ?? 0),
      completed: safeNumber(backlogStatus.completed ?? 0),
      pending: safeNumber(backlogStatus.pending ?? 0),
      percent: safePercent(backlogStatus.percent ?? 0),
      donutData: normalizeChartData(backlogStatus.donutData, [
        { value: safeNumber(backlogStatus.completed ?? 0), color: "#39A900" },
        { value: safeNumber(backlogStatus.pending ?? 0) || 1, color: "#EAF7E1" },
      ]),
    },
    epicStatus: {
      total: safeNumber(epicStatus.total ?? 0),
      active: safeNumber(epicStatus.active ?? 0),
      completed: safeNumber(epicStatus.completed ?? 0),
      pending: safeNumber(epicStatus.pending ?? 0),
      percent: safePercent(epicStatus.percent ?? 0),
      data: normalizeChartData(epicStatus.data, [
        { name: "Completadas", value: safeNumber(epicStatus.data?.[0]?.value ?? 0), color: "#7C4DFF" },
        { name: "Pendientes", value: safeNumber(epicStatus.data?.[1]?.value ?? 0), color: "#FF8A26" },
      ]),
      epics: normalizeChartData(epicStatus.epics, []),
    },
    teamMembers: teamMembers.map((member) => ({
      ...member,
      tareasAsignadas: safeNumber(member.tareasAsignadas ?? member.tasks ?? member.tareas_asignadas ?? 0),
      tareasCompletadas: safeNumber(member.tareasCompletadas ?? member.completed ?? 0),
      tareasEnProgreso: safeNumber(member.tareasEnProgreso ?? member.inProgress ?? 0),
      tareasPorHacer: safeNumber(member.tareasPorHacer ?? member.pending ?? 0),
      historiasAsignadas: safeNumber(member.historiasAsignadas ?? member.stories ?? 0),
      productividad: safePercent(member.productividad ?? member.compliance ?? 0),
      nombre: member.nombre || member.name || member.usuario || member.email || "Sin nombre",
      rol: member.rol || member.role || "Integrante",
      stories: safeNumber(member.historiasAsignadas ?? member.stories ?? 0),
      tasks: safeNumber(member.tareasAsignadas ?? member.tasks ?? 0),
      completed: safeNumber(member.tareasCompletadas ?? member.completed ?? 0),
      inProgress: safeNumber(member.tareasEnProgreso ?? member.inProgress ?? 0),
      pending: safeNumber(member.tareasPorHacer ?? member.pending ?? 0),
      compliance: safePercent(member.productividad ?? member.compliance ?? 0),
      trend: normalizeChartData(member.trend, []),
      initials: member.initials || "NA",
      bg: member.bg || "#7C4DFF",
    })),
  };
};

export function useMetricasDashboard(proyectoId, sprintId) {
  const [data, setData] = useState(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetricas = useCallback(async ({ silent = false } = {}) => {
    if (!proyectoId) {
      setData(initialDashboardData);
      setLoading(false);
      setRefreshing(false);
      setError("Selecciona un proyecto para ver sus metricas");
      return;
    }

    if (!silent) {
      setLoading(true);
      setData(initialDashboardData);
    }
    setRefreshing(true);
    setError(null);

    try {
      console.log("[metricas][useMetricasDashboard] Proyecto seleccionado:", proyectoId);
      console.log("[metricas][useMetricasDashboard] ID enviado:", proyectoId);
      
      let metricas;
      if (USE_MOCK_DATA) {
        // Simulamos el retardo de la red
        await new Promise((resolve) => setTimeout(resolve, 800));
        metricas = MOCK_DATA;
      } else {
        metricas = await getMetricasProyecto(proyectoId, sprintId);
      }
      
      setData(normalizeMetricasData(metricas || initialDashboardData));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "No se pudieron cargar las metricas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [proyectoId, sprintId]);

  const refresh = useCallback(() => loadMetricas(), [loadMetricas]);

  return useMemo(
    () => ({
      ...data,
      loading,
      error,
      refreshing,
      refresh,
    }),
    [data, error, loading, refreshing, refresh],
  );
}
