const STORAGE_KEY = "scrum.active_project_id";
export const ACTIVE_PROJECT_CHANGED_EVENT = "scrum:active-project-changed";

const emitActiveProjectChange = (projectId) => {
  try {
    window.dispatchEvent(
      new CustomEvent(ACTIVE_PROJECT_CHANGED_EVENT, {
        detail: { projectId },
      }),
    );
  } catch {
    // Ignore event dispatch failures
  }
};

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
      emitActiveProjectChange("");
      return;
    }

    localStorage.setItem(STORAGE_KEY, String(projectId));
    emitActiveProjectChange(String(projectId));
  } catch {
    // Ignore storage failures (private mode / denied access)
  }
};
