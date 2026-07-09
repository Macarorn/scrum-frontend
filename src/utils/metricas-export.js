import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx-js-style";

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

const applyTableStyle = (ws) => {
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const colWidths = [];

  // Auto-size columns and apply styles
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let max = 15; // min width
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
      let cell = ws[cellRef];
      if (!cell) {
        ws[cellRef] = { t: "s", v: "" };
        cell = ws[cellRef];
      }
      
      const len = cell.v ? cell.v.toString().length : 0;
      if (len > max) max = len;

      // Header row
      if (R === 0) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "39A900" } }, // Theme Green
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "39A900" } },
            bottom: { style: "thin", color: { rgb: "39A900" } },
            left: { style: "thin", color: { rgb: "39A900" } },
            right: { style: "thin", color: { rgb: "39A900" } },
          },
        };
      } else {
        // Data rows
        cell.s = {
          font: { color: { rgb: "374151" } },
          alignment: { vertical: "center", horizontal: typeof cell.v === "number" || cell.v.toString().includes("%") ? "right" : "left" },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
          },
        };
        // Alternating row colors
        if (R % 2 !== 0) {
          cell.s.fill = { fgColor: { rgb: "F9FAFB" } };
        }
      }
    }
    colWidths.push({ wch: max + 4 }); // Add padding
  }
  ws["!cols"] = colWidths;
};

const applyGeneralStyle = (ws) => {
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const colWidths = [{ wch: 30 }, { wch: 30 }]; // Fixed nice widths for general
  ws["!cols"] = colWidths;

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
      const cell = ws[cellRef];
      if (!cell) continue;

      // Metadata Headers (Dashboard, Sprint) and Table Header (Métrica, Valor)
      if ((R === 0 || R === 1 || R === 3) && C === 0) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "39A900" } },
          alignment: { vertical: "center" },
          border: { bottom: { style: "thin", color: { rgb: "39A900" } } },
        };
      } else if (R === 3 && C === 1) { // "Valor" header
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "39A900" } },
          alignment: { vertical: "center", horizontal: "center" },
          border: { bottom: { style: "thin", color: { rgb: "39A900" } } },
        };
      } else if (C === 0 && R > 3) { // Metric labels
        cell.s = {
          font: { bold: true, color: { rgb: "1F2937" } },
          fill: { fgColor: { rgb: "F3F4F6" } },
          alignment: { vertical: "center" },
          border: {
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
          },
        };
      } else { // Values
        cell.s = {
          font: { color: { rgb: "374151" }, bold: R === 0 || R === 1 }, // Bold the project/sprint names
          alignment: { vertical: "center", horizontal: R > 3 ? "right" : "left" },
          border: {
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
          },
        };
      }
    }
  }
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
    "Nombre de la Épica": epica.nombre || epica.name || epica.titulo || "Sin nombre",
    "Estado": epica.estado || epica.status || "Sin estado",
    "Progreso (%)": epica.progreso ?? epica.progress ?? 0,
    "Total Tareas": epica.tareas ?? epica.tasks ?? 0,
  }));

  const historias = normalizeArray(data.historias).map((historia) => ({
    "Historia de Usuario": historia.nombre || historia.name || historia.titulo || "Sin nombre",
    "Estado": historia.estado || historia.status || "Sin estado",
    "Prioridad": historia.prioridad || historia.priority || "Sin prioridad",
    "Épica Asignada": historia.epica || historia.epic || "Sin épica",
  }));

  const tareas = normalizeArray(data.tareas).map((tarea) => ({
    "Tarea": tarea.nombre || tarea.name || tarea.titulo || "Sin nombre",
    "Estado": tarea.estado || tarea.status || "Sin estado",
    "Responsable": tarea.responsable || tarea.assignee || tarea.asignado || "Sin asignar",
    "Historia de Usuario": tarea.historia || tarea.story || "Sin historia",
  }));

  const wsGeneral = XLSX.utils.aoa_to_sheet(generalRows);
  applyGeneralStyle(wsGeneral);
  XLSX.utils.book_append_sheet(workbook, wsGeneral, "General");

  if (epicas.length > 0) {
    const wsEpicas = XLSX.utils.json_to_sheet(epicas);
    applyTableStyle(wsEpicas);
    XLSX.utils.book_append_sheet(workbook, wsEpicas, "Epicas");
  }

  if (historias.length > 0) {
    const wsHistorias = XLSX.utils.json_to_sheet(historias);
    applyTableStyle(wsHistorias);
    XLSX.utils.book_append_sheet(workbook, wsHistorias, "Historias");
  }

  if (tareas.length > 0) {
    const wsTareas = XLSX.utils.json_to_sheet(tareas);
    applyTableStyle(wsTareas);
    XLSX.utils.book_append_sheet(workbook, wsTareas, "Tareas");
  }

  const safeProjectName = projectName || "dashboard";
  const safeSprintName = sprintName ? `-${sprintName.replace(/[^a-z0-9]+/gi, "-")}` : "";
  XLSX.writeFile(workbook, `${safeProjectName}${safeSprintName}-metricas.xlsx`);
};
