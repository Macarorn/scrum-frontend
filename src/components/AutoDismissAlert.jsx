import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import './AutoDismissAlert.css';

/**
 * AutoDismissAlert
 * - auto-cierra después de `timeout` ms
 * - se cierra al cambiar de ruta
 * - salida suave con animación antes de llamar a `onClose`
 */
const AutoDismissAlert = ({ show, variant = 'info', onClose = () => {}, timeout = 4000, children, className = '' }) => {
  const location = useLocation();
  const [visible, setVisible] = useState(Boolean(show));
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const exitDuration = 280; // should match CSS transition

  // sync when show becomes true
  useEffect(() => {
    if (show) {
      setExiting(false);
      setVisible(true);
    }
  }, [show]);

  // auto-dismiss timer: start exit animation then call onClose
  useEffect(() => {
    if (!visible) return undefined;
    // clear any previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (show) {
      timerRef.current = setTimeout(() => {
        // start exit animation
        setExiting(true);
        // call parent's onClose after exit animation
        timerRef.current = setTimeout(() => {
          try { onClose(); } catch {};
        }, exitDuration);
      }, timeout);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, show, timeout]);

  // Close immediately (with animation) when route changes
  useEffect(() => {
    if (!visible) return undefined;
    // trigger exit and call onClose after animation
    setExiting(true);
    const t = setTimeout(() => {
      try { onClose(); } catch {};
    }, exitDuration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // If parent cleared `show` (controlled prop), animate exit then unmount
  useEffect(() => {
    if (show) return undefined;
    if (!visible) return undefined;
    if (exiting) return undefined;

    setExiting(true);
    const t = setTimeout(() => {
      setVisible(false);
    }, exitDuration);
    return () => clearTimeout(t);
  }, [show, visible, exiting]);

  const handleManualClose = () => {
    // start exit animation, then call onClose
    setExiting(true);
    setTimeout(() => {
      try { onClose(); } catch {};
    }, exitDuration);
  };

  if (!visible) return null;

  return (
    <div className={`auto-dismiss-wrapper ${exiting ? 'auto-dismiss-exit' : 'auto-dismiss-enter'}`}>
      <div className="auto-dismiss-inner">
        <Alert variant={variant} className={className} dismissible onClose={handleManualClose}>
          {children}
        </Alert>
      </div>
    </div>
  );
};

export default AutoDismissAlert;
