import { useCallback, useEffect, useMemo, useState } from "react";
import { obtenerMetricasProyecto } from "../services/metricas.service";

const REFRESH_INTERVAL_MS = 30000;

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

export function useMetricasDashboard(proyectoId, sprintId = null) {
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
      console.log("[metricas][useMetricasDashboard] Proyecto seleccionado:", proyectoId, "Sprint:", sprintId);
      const metricas = await obtenerMetricasProyecto(proyectoId, sprintId);
      setData(metricas || initialDashboardData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "No se pudieron cargar las metricas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [proyectoId, sprintId]);

  useEffect(() => {
    loadMetricas();
    const intervalId = window.setInterval(() => {
      loadMetricas({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadMetricas]);

  return useMemo(
    () => ({
      ...data,
      loading,
      error,
      refreshing,
      refresh: () => loadMetricas(),
    }),
    [data, error, loadMetricas, loading, refreshing],
  );
}
