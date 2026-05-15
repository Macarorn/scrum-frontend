import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CrearProyecto.css";

export default function CrearProyecto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCrearProyecto = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/crear-proyecto-form");
      setLoading(false);
    }, 300);
  };

  return (
    <div className="scrum-welcome-container">
      <div className="welcome-content">
        
        <div className="welcome-header">
          <span className="welcome-badge">Scrum Workspace</span>
          <h1 className="welcome-title">Bienvenido a Scrum</h1>
          <p className="welcome-subtitle">
            Elige tu próximo paso para empezar a colaborar con tu equipo en el nuevo espacio de trabajo.
          </p>
        </div>

        <div className="botones-container">
          <button
            className="btn-welcome-action"
            onClick={handleCrearProyecto}
            disabled={loading}
          >
            <div className="action-icon-wrapper">
              <svg className="btn-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <div className="action-content">
              <span className="btn-welcome-text">Crear un Proyecto</span>
              <span className="btn-welcome-desc">Inicia un nuevo tablero para tu equipo desde cero.</span>
            </div>
          </button>

          <button
            className="btn-welcome-action"
            onClick={() => navigate("/unirse-proyecto")}
          >
            <div className="action-icon-wrapper">
              <svg className="btn-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <div className="action-content">
              <span className="btn-welcome-text">Unirse a un proyecto</span>
              <span className="btn-welcome-desc">Busca y solicita acceso a proyectos existentes.</span>
            </div>
          </button>

          <button
            className="btn-welcome-action"
            onClick={() => navigate("/perfil")}
          >
            <div className="action-icon-wrapper">
              <svg className="btn-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="action-content">
              <span className="btn-welcome-text">Ir a Perfil</span>
              <span className="btn-welcome-desc">Configura tu cuenta y ajusta tus preferencias personales.</span>
            </div>
          </button>
        </div>

        <div className="beneficios-section">
          <div className="beneficio-item">
            <div className="beneficio-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span className="beneficio-text">Colaboración total</span>
          </div>

          <div className="beneficio-item">
            <div className="beneficio-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <span className="beneficio-text">Alta calidad</span>
          </div>

          <div className="beneficio-item">
            <div className="beneficio-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span className="beneficio-text">Entregas ágiles</span>
          </div>
        </div>

      </div>
    </div>
  );
}
