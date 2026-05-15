import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to auto-dismiss a message after a timeout and on route change.
 * @param {string} value - The message value to watch.
 * @param {function} clearFn - Function to clear the message (e.g. setMessage).
 * @param {number} timeout - Milliseconds until auto-dismiss (default 5000).
 */
const useAutoDismiss = (value, clearFn, timeout = 4000) => {
  const location = useLocation();

  useEffect(() => {
    if (!value) return undefined;

    const timer = setTimeout(() => {
      try { clearFn(''); } catch { /* ignore */ }
    }, timeout);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, timeout]);

  // Clear on route change
  useEffect(() => {
    if (!value) return undefined;
    try { clearFn(''); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
};

export default useAutoDismiss;
