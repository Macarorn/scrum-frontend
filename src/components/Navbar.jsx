import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getAccessToken,
  logoutSession,
  subscribeAuthChanges,
} from "../services/auth.service";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAccessToken()),
  );

  const navigate = useNavigate();

  // 🔥 escucha cambios de login/logout automáticamente
  useEffect(() => {
    const unsubscribe = subscribeAuthChanges(() => {
      setIsAuthenticated(Boolean(getAccessToken()));
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    navigate("/", { replace: true });
    void logoutSession();
  };

  return (
    <header className="lp-header">
      <div className="lp-logo">
        scrum<span className="lp-logo-accent">Track</span>
      </div>

      <nav className="lp-nav">
        {!isAuthenticated ? (
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
