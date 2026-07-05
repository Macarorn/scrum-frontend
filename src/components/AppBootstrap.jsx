import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearSessionTokens,
  hasValidSession,
  isCoordinador,
} from "../services/auth.service";
import { obtenerPerfil } from "../services/perfil.service";
import {
  getActiveProjectId,
  setActiveProjectId,
} from "../services/project-context.service";
import {
  listarProyectos,
  listarTodosProyectos,
} from "../services/proyectos.service";
import { LoadingScreen, StepLoader } from "./scrumtrack-loaders";
import "./AppBootstrap.css";

const BOOTSTRAP_STEPS = [
  "Verificando sesión",
  "Cargando proyectos",
  "Sincronizando datos",
  "Preparando panel",
];

export default function AppBootstrap({ children }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!hasValidSession()) {
        navigate("/acceso-denegado", {
          replace: true,
          state: {
            message: "Tienes que iniciar sesión para acceder a esta pantalla.",
          },
        });
        return;
      }

      setCurrentStep(1);

      let proyectos = [];
      try {
        const response = isCoordinador()
          ? await listarTodosProyectos()
          : await listarProyectos();
        proyectos = response?.data || [];
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          clearSessionTokens();
          navigate("/login", { replace: true });
          return;
        }
      }

      if (cancelled) return;
      setCurrentStep(2);

      const activeId = getActiveProjectId();
      if (proyectos.length > 0) {
        const activeExists = activeId
          ? proyectos.some(
              (proyecto) =>
                String(proyecto.id_proyecto) === String(activeId),
            )
          : false;

        if (!activeExists) {
          setActiveProjectId(String(proyectos[0].id_proyecto));
        }
      } else if (activeId) {
        setActiveProjectId("");
      }

      if (cancelled) return;
      setCurrentStep(3);

      try {
        await obtenerPerfil();
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          clearSessionTokens();
          navigate("/login", { replace: true });
          return;
        }
      }

      if (cancelled) return;
      setCurrentStep(BOOTSTRAP_STEPS.length);
      setReady(true);
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="app-bootstrap">
        <LoadingScreen hideMessage />
        <div className="app-bootstrap__steps">
          <StepLoader steps={BOOTSTRAP_STEPS} currentStep={currentStep} />
        </div>
      </div>
    );
  }

  return children;
}
