import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";
import "./App.css";
import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { Suspense, lazy } from "react";
import ListaUsuarios from "./pages/ListaUsuarios/ListaUsuarios";
import DocumentosProyectoPage from "./pages/DocumentosProyecto/DocumentosProyectoPage";
import AppShell from "./components/AppShell";
import ScrumTrackLoader from "./components/ScrumTrackLoader";
import PublicLayout from "./components/PublicLayout";
import LandingLayout from "./components/LandingLayout";
import RequireAuth from "./components/RequireAuth";
import AccessDenied from "./components/AccessDenied";
import DetallesDeProyecto from "./pages/DetallesProyecto/DetallesProyecto";
import Notificaciones from "./pages/Notificaciones/Notificaciones";
import PerfilUsuario from "./pages/PerfilUsuario/PerfilUsuario";
import CrearProyecto from "./pages/Proyectos/CrearProyecto";
import CrearProyectoForm from "./pages/Proyectos/CrearProyectoForm";
import ProyectosOverview from "./pages/Proyectos/ProyectosOverview";
import UnirseProyecto from "./pages/Proyectos/UnirseProyecto";
import SprintBoard from "./pages/Sprints/SprintBoard";
import SprintDetail from "./pages/Sprints/SprintDetail";
import SprintList from "./pages/Sprints/SprintList";
import Metricas from "./pages/Metricas/Metricas";
import ProjectMetrics from "./pages/Metrics/ProjectMetrics";
import DocumentosProyectoPage from "./pages/DocumentosProyecto/DocumentosProyectoPage";

import { getAccessToken, subscribeAuthChanges } from "./services/auth.service";

import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";

function AppRoutes({ isAuthenticated }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* 🔓 RUTAS PÚBLICAS (LOGIN/REGISTER) SIN NAVBAR */}
        <Route element={<PublicLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/perfil" /> : <PageTransition><Login /></PageTransition>}
          />

          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/perfil" /> : <PageTransition><Register /></PageTransition>}
          />
          <Route path="/acceso-denegado" element={<PageTransition><AccessDenied /></PageTransition>} />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/perfil" /> : <PageTransition><ForgotPassword /></PageTransition>}
          />
          <Route
            path="/reset-password"
            element={isAuthenticated ? <Navigate to="/perfil" /> : <PageTransition><ResetPassword /></PageTransition>}
          />
          <Route
            path="/verify-email"
            element={<PageTransition><VerifyEmail /></PageTransition>}
          />
        </Route>

        {/* 🔓 LANDING PAGE CON NAVBAR */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/home" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/scrum-guide" element={<PageTransition><ScrumGuide /></PageTransition>} />
        </Route>

        {/* 🔐 RUTAS PROTEGIDAS */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/perfil" element={<PageTransition><PerfilUsuario /></PageTransition>} />
            <Route path="/dashboard" element={<Navigate to="/proyectos" replace />} />
            <Route path="/crear-proyecto" element={<PageTransition><CrearProyecto /></PageTransition>} />
            <Route
              path="/crear-proyecto-form"
              element={<PageTransition><CrearProyectoForm /></PageTransition>}
            />
            <Route path="/proyectos" element={<PageTransition><ProyectosOverview /></PageTransition>} />
            <Route path="/backlog" element={<PageTransition><Backlog /></PageTransition>} />
            <Route path="/epicas" element={<PageTransition><EpicasOverview /></PageTransition>} />
            <Route path="/epicas/nueva" element={<PageTransition><EpicaForm /></PageTransition>} />
            <Route path="/epicas/:idEpica" element={<PageTransition><EpicaDetalle /></PageTransition>} />
            <Route
              path="/historias/:idHistoria"
              element={<PageTransition><HistoriaDetalle /></PageTransition>}
            />
            <Route path="/sprints" element={<SprintList />} />
            <Route path="/sprints/:idSprint" element={<SprintDetail />} />
            <Route path="/kanban" element={<SprintBoard />} />
            <Route path="/metricas" element={<Metricas />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/notificaciones" element={<Notificaciones />} />
            <Route path="/unirse-proyecto" element={<UnirseProyecto />} />
            <Route path="/lista-usuarios" element={<ListaUsuarios />} />
            <Route path="/projects/:id/members" element={<ListaUsuarios />} />
            <Route path="/projects/:id/documents" element={<DocumentosProyectoPage />} />
            <Route
              path="/detalles_de_proyecto/:id"
              element={<PageTransition><DetallesDeProyecto /></PageTransition>}
            />
          </Route>
        </Route>

        {/* 🔁 FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAccessToken()),
  );

  useEffect(() => {
    const unsubscribe = subscribeAuthChanges(() => {
      setIsAuthenticated(Boolean(getAccessToken()));
    });

    return unsubscribe;
  }, []);

  return (
    <Router>
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      }>
        <AppRoutes isAuthenticated={isAuthenticated} />
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        limit={1}
      />
    </Router>
  );
}


export default App;
