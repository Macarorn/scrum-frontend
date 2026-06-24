import { useCallback, useEffect, useRef, useState } from "react";
import { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { getTourSteps } from "../constants/tourSteps";

const STORAGE_PREFIX = "scrum.tour.completed.";

/**
 * Normalises a pathname into a stable localStorage key.
 * e.g.  "/sprints/42"  → "/sprints"
 */
function pageKey(pathname) {
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  return "/" + (segments[0] || "");
}

function isCompleted(key) {
  try {
    return localStorage.getItem(STORAGE_PREFIX + key) === "1";
  } catch {
    return false;
  }
}

function markCompleted(key) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, "1");
  } catch {
    // Storage might be full or disabled
  }
}

/**
 * Custom hook for tour logic using react-joyride v3 API.
 *
 * @param {string} pathname – current location.pathname
 */
export function useTour(pathname) {
  const key = pageKey(pathname);
  const baseSteps = getTourSteps(pathname);
  // En react-joyride v3 la propiedad se llama skipBeacon, no disableBeacon.
  const steps = baseSteps.map(step => ({ ...step, skipBeacon: true }));

  const [run, setRun] = useState(false);

  /**
   * Manually start (or restart) the tour.
   */
  const startTour = useCallback(() => {
    if (steps.length === 0) return;
    setRun(false);
    // Need to briefly set to false then true to reset Joyride
    setTimeout(() => setRun(true), 100);
  }, [steps.length]);

  /**
   * onEvent callback for react-joyride v3.
   */
  const handleEvent = useCallback(
    (data) => {
      const { action, status, type } = data;

      // Tour finished or skipped
      if (
        status === STATUS.FINISHED ||
        status === STATUS.SKIPPED
      ) {
        setRun(false);
        markCompleted(key);
        return;
      }

      // Close action
      if (action === ACTIONS.CLOSE) {
        setRun(false);
        markCompleted(key);
      }
    },
    [key],
  );

  return {
    steps,
    run,
    startTour,
    handleEvent,
  };
}
