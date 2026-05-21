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

  // 1. Remove AutoDismissAlert import
  content = content.replace(/import\s+AutoDismissAlert\s+from\s+["'].*?AutoDismissAlert["'];?\n/g, "");

  // 2. Add alerts import
  if (!content.includes("showError")) {
    const alertsImportPath = calculateRelativePath(relPath);
    content = content.replace(
      /(import\s+.*?;?\n)/,
      `$1import { showError, showSuccess, showWarning, showInfo } from "${alertsImportPath}";\n`
    );
  }

  // 3. Replace setError(msg) with showError(msg) unless it's setError("") or setError(null)
  content = content.replace(/setError\(([^)]+)\)/g, (match, arg) => {
    if (arg.trim() === '""' || arg.trim() === "''" || arg.trim() === "null") {
      return match;
    }
    return `showError(${arg});\n      setError("")`;
  });

  // 4. Replace setSuccess(msg) with showSuccess(msg) unless it's setSuccess("") or setSuccess(null)
  content = content.replace(/setSuccess\(([^)]+)\)/g, (match, arg) => {
    if (arg.trim() === '""' || arg.trim() === "''" || arg.trim() === "null") {
      return match;
    }
    return `showSuccess(${arg});\n      setSuccess("")`;
  });

  // 5. Replace setConsentError/setActionMessage etc if needed? 
  // For actionMessage, actionType we did this in detalles_de_proyecto manually.
  
  // 6. Delete rendering of <AutoDismissAlert>
  content = content.replace(/<AutoDismissAlert[\s\S]*?<\/AutoDismissAlert>/g, "");
  
  // 7. Delete rendering of react-bootstrap Alert if they are just for error/success
  content = content.replace(/\{error\s*&&\s*\([\s\S]*?<Alert[\s\S]*?\{error\}[\s\S]*?<\/Alert>\s*\)\s*\}/g, "");
  content = content.replace(/\{success\s*&&\s*\([\s\S]*?<Alert[\s\S]*?\{success\}[\s\S]*?<\/Alert>\s*\)\s*\}/g, "");

  fs.writeFileSync(absolutePath, content, "utf-8");
  console.log("Processed " + relPath);
}
