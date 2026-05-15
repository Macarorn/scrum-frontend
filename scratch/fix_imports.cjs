const fs = require("fs");
const path = require("path");

const filesToProcess = [
  "src/pages/Backlog/Backlog.jsx",
  "src/pages/Epicas/EpicaDetalle.jsx",
  "src/pages/Epicas/EpicaForm.jsx",
  "src/pages/Epicas/EpicasOverview.jsx",
  "src/pages/Historias/HistoriaDetalle.jsx",
  "src/pages/Notificaciones.jsx",
  "src/pages/Proyectos/CrearProyectoForm.jsx",
  "src/pages/Sprints/SprintBoard.jsx",
  "src/pages/Sprints/SprintDetail.jsx",
  "src/pages/Sprints/SprintList.jsx",
  "src/pages/Tareas/TareaNueva.jsx"
];

function calculateRelativePath(filePath) {
  const depth = filePath.split('/').length - 2;
  const prefix = depth > 0 ? "../".repeat(depth) : "./";
  return prefix + "utils/alerts";
}

for (const relPath of filesToProcess) {
  const absolutePath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(absolutePath)) continue;

  let content = fs.readFileSync(absolutePath, "utf-8");

  const usesAlerts = content.includes("showError") || content.includes("showSuccess") || content.includes("showWarning") || content.includes("showInfo");
  const importsAlerts = content.includes("utils/alerts");

  if (usesAlerts && !importsAlerts) {
    const alertsImportPath = calculateRelativePath(relPath);
    content = `import { showError, showSuccess, showWarning, showInfo } from "${alertsImportPath}";\n` + content;
    fs.writeFileSync(absolutePath, content, "utf-8");
    console.log("Fixed imports in " + relPath);
  }
}
