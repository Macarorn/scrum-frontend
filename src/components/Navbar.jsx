import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getAccessToken,
  logoutSession,
  subscribeAuthChanges,
} from "../services/auth.service";

const Navbar = ({ isOpen = false, onToggleSidebar = () => {} }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAccessToken()),
  );

  const location = useLocation();
  const navigate = useNavigate();

  // escucha cambios de login/logout automáticamente
  useEffect(() => {
    const unsubscribe = subscribeAuthChanges(() => {
      setIsAuthenticated(Boolean(getAccessToken()));
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await logoutSession();
    window.location.href = "/login";
  };

  const isPublicRoute = ["/", "/scrum-guide", "/login", "/register"].includes(location.pathname);

  return (
    <header className="lp-header">
      {!isPublicRoute && (
        <button
          aria-label="Abrir menú"
          aria-controls="app-sidebar"
          aria-expanded={isOpen}
          className="hamburger"
          onClick={onToggleSidebar}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className="lp-logo">
        scrum<span className="lp-logo-accent">Track</span>
      </div>

      <nav className="lp-nav">
        {!isAuthenticated || isPublicRoute ? (
          <>
            <Link to="/login" className="lp-btn-link">
              Acceder
            </Link>

            <Link to="/register" className="lp-btn-primary">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            <Link to="/perfil" className="lp-btn-link">
              Mi Perfil
            </Link>

            <button onClick={handleLogout} className="lp-btn-primary">
              Cerrar sesión
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
