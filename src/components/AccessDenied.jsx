import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../assets/stylos-access-denegado.css";

const AccessDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message =
    location.state?.message ||
    "Tienes que iniciar sesión para acceder a esta pantalla.";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login", {
        replace: true,
        state: { from: location.state?.from || location.pathname },
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [location.pathname, location.state?.from, navigate]);

  return (
    <main className="denied-page">
      <section className="denied-card">
        <span className="denied-badge">Acceso restringido</span>
        <h1>No puedes entrar aquí</h1>
        <p>{message}</p>
        <p className="denied-note">
          Serás redirigido al login en unos segundos.
        </p>

        <div className="denied-actions">
          <button
            type="button"
            className="denied-button"
            onClick={() =>
              navigate("/login", {
                state: { from: location.state?.from || location.pathname },
              })
            }
          >
            Ir al login
          </button>

          <Link to="/" className="denied-link">
            Volver al landing
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AccessDenied;
