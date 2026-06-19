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
  const steps = getTourSteps(pathname);

  const [run, setRun] = useState(false);
  const autoStartedRef = useRef(false);

  // Auto-start the tour the first time the user visits a page.
  useEffect(() => {
    setRun(false);
    autoStartedRef.current = false;

    if (steps.length === 0) return;

    // Delay to let the page render and load data before highlighting targets.
    const timer = setTimeout(() => {
      if (!isCompleted(key) && !autoStartedRef.current) {
        autoStartedRef.current = true;
        setRun(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [key, steps.length]);

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
