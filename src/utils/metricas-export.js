import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const formatNumber = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0";
  return numericValue.toLocaleString("es-ES");
};

const formatPercent = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0%";
  return `${numericValue.toFixed(0)}%`;
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

export const exportMetricsPdf = async ({ dashboardElement, projectName, sprintName, data }) => {
  if (!dashboardElement) return;

  const canvas = await html2canvas(dashboardElement, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = margin;
  let heightLeft = imgHeight;

  pdf.setFontSize(14);
  pdf.setTextColor(17, 24, 39);
  pdf.text(`Dashboard de métricas${projectName ? ` - ${projectName}` : ""}`, margin, 12);
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text(sprintName ? `Sprint: ${sprintName}` : "Resumen del proyecto", margin, 20);

  pdf.addImage(imgData, "PNG", margin, 24, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pageHeight - 32;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 24;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight - 16;
  }

  const safeProjectName = projectName || "dashboard";
  const safeSprintName = sprintName ? `-${sprintName.replace(/[^a-z0-9]+/gi, "-")}` : "";
  pdf.save(`${safeProjectName}${safeSprintName}-metricas.pdf`);
};

export const exportMetricsExcel = ({ data = {}, projectName, sprintName }) => {
  const workbook = XLSX.utils.book_new();
  const generalRows = [
    ["Dashboard de métricas", projectName || "Proyecto"],
    ["Sprint", sprintName || "Actual"],
    [],
    ["Métrica", "Valor"],
    ["Progreso del backlog", formatPercent(data.backlogStatus?.percent ?? data.kpis?.backlogProgress ?? 0)],
    ["Backlog completado", formatNumber(data.backlogStatus?.completed ?? data.kpis?.completedBacklog ?? 0)],
    ["Backlog pendiente", formatNumber(data.backlogStatus?.pending ?? 0)],
    ["Épicas completadas", formatNumber(data.epicStatus?.completed ?? data.kpis?.completedEpics ?? 0)],
    ["Épicas pendientes", formatNumber(data.epicStatus?.pending ?? data.kpis?.pendingEpics ?? 0)],
    ["Historias completadas", formatNumber(data.kpis?.completedStories ?? 0)],
    ["Historias en progreso", formatNumber(data.kpis?.inProgressStories ?? 0)],
    ["Tareas completadas", formatNumber(data.kpis?.completedTasks ?? 0)],
    ["Tareas pendientes", formatNumber(data.kpis?.pendingTasks ?? 0)],
  ];

  const epicas = normalizeArray(data.epicas || data.epicStatus?.epics).map((epica) => ({
    nombre: epica.nombre || epica.name || epica.titulo || "Sin nombre",
    estado: epica.estado || epica.status || "Sin estado",
    progreso: epica.progreso ?? epica.progress ?? 0,
    tareas: epica.tareas ?? epica.tasks ?? 0,
  }));

  const historias = normalizeArray(data.historias).map((historia) => ({
    nombre: historia.nombre || historia.name || historia.titulo || "Sin nombre",
    estado: historia.estado || historia.status || "Sin estado",
    prioridad: historia.prioridad || historia.priority || "Sin prioridad",
    epica: historia.epica || historia.epic || "Sin épica",
  }));

  const tareas = normalizeArray(data.tareas).map((tarea) => ({
    nombre: tarea.nombre || tarea.name || tarea.titulo || "Sin nombre",
    estado: tarea.estado || tarea.status || "Sin estado",
    responsable: tarea.responsable || tarea.assignee || tarea.asignado || "Sin asignar",
    historia: tarea.historia || tarea.story || "Sin historia",
  }));

  const porcentajes = [
    ["Sección", "Porcentaje"],
    ["Progreso del proyecto", formatPercent(data.projectProgress?.percent ?? 0)],
    ["Progreso backlog", formatPercent(data.backlogStatus?.percent ?? data.kpis?.backlogProgress ?? 0)],
    ["Progreso épicas", formatPercent(data.epicStatus?.percent ?? 0)],
    ["Cumplimiento promedio", formatPercent(data.teamMembers?.[0]?.compliance ?? data.kpis?.compliance ?? 0)],
  ];

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(generalRows), "General");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(epicas), "Epicas");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(historias), "Historias");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(tareas), "Tareas");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(porcentajes), "Porcentajes");

  const safeProjectName = projectName || "dashboard";
  const safeSprintName = sprintName ? `-${sprintName.replace(/[^a-z0-9]+/gi, "-")}` : "";
  XLSX.writeFile(workbook, `${safeProjectName}${safeSprintName}-metricas.xlsx`);
};
