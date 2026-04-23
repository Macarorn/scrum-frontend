const STORAGE_KEY = "scrum.active_project_id";

export const getActiveProjectId = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

export const setActiveProjectId = (projectId) => {
  try {
    if (!projectId) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, String(projectId));
  } catch {
    // Ignore storage failures (private mode / denied access)
  }
};
