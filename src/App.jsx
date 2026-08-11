import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";
import "./App.css";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import OfflineBanner from "./components/OfflineBanner";

import ListaUsuarios from "./pages/ListaUsuarios/ListaUsuarios";
import AppShell from "./components/AppShell";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";
import Backlog from "./pages/Backlog/Backlog";
import Calendario from "./pages/Calendario";

// Lazy-loaded heavy pages for code splitting
const SprintBoard = lazy(() => import("./pages/Sprints/SprintBoard"));
const Notificaciones = lazy(() => import("./pages/Notificaciones/Notificaciones"));
const ProjectMetrics = lazy(() => import("./pages/Metrics/ProjectMetrics"));
const DocumentosProyectoPage = lazy(() => import("./pages/DocumentosProyecto/DocumentosProyectoPage"));
const Metricas = lazy(() => import("./pages/Metricas/Metricas"));
import EpicaDetalle from "./pages/Epicas/EpicaDetalle";
import EpicaForm from "./pages/Epicas/EpicaForm";
import EpicasOverview from "./pages/Epicas/EpicasOverview";
import HistoriaDetalle from "./pages/Historias/HistoriaDetalle";
import LandingPage from "./components/LandingPage";
import ScrumGuide from "./components/ScrumGuide";
import CookiesPage from "./pages/Legal/CookiesPage";
import PrivacyPolicyPage from "./pages/Legal/PrivacyPolicyPage";
import FAQPage from "./pages/Legal/FAQPage";
import ContactPage from "./pages/Legal/ContactPage";

import PublicLayout from "./components/PublicLayout";
import LandingLayout from "./components/LandingLayout";
import RequireAuth from "./components/RequireAuth";
import AccessDenied from "./components/AccessDenied";
import DetallesDeProyecto from "./pages/DetallesProyecto/DetallesProyecto";
import PerfilUsuario from "./pages/PerfilUsuario/PerfilUsuario";
import CrearProyecto from "./pages/Proyectos/CrearProyecto";
import CrearProyectoForm from "./pages/Proyectos/CrearProyectoForm";
import ProyectosOverview from "./pages/Proyectos/ProyectosOverview";
import UnirseProyecto from "./pages/Proyectos/UnirseProyecto";
import SprintDetail from "./pages/Sprints/SprintDetail";
import SprintList from "./pages/Sprints/SprintList";

const LazyFallback = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
    <div className="spinner-border text-success" role="status">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

import { getAccessToken, subscribeAuthChanges } from "./services/auth.service";

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
      <OfflineBanner />
      <Routes>
        {/* 🔓 RUTAS PÚBLICAS (LOGIN/REGISTER) SIN NAVBAR */}
        <Route element={<PublicLayout />}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/perfil" /> : <Login />}
          />

          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/perfil" /> : <Register />}
          />
          <Route path="/acceso-denegado" element={<AccessDenied />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* 🔓 LANDING PAGE CON NAVBAR */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/scrum-guide" element={<ScrumGuide />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/politica-datos" element={<PrivacyPolicyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contacto" element={<ContactPage />} />
        </Route>

        {/* 🔐 RUTAS PROTEGIDAS */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/perfil" element={<PerfilUsuario />} />
            <Route path="/crear-proyecto" element={<CrearProyecto />} />
            <Route
              path="/crear-proyecto-form"
              element={<CrearProyectoForm />}
            />
            <Route path="/proyectos" element={<ProyectosOverview />} />
            <Route path="/backlog" element={<Backlog />} />
            <Route path="/epicas" element={<EpicasOverview />} />
            <Route path="/epicas/nueva" element={<EpicaForm />} />
            <Route path="/epicas/:idEpica" element={<EpicaDetalle />} />
            <Route
              path="/historias/:idHistoria"
              element={<HistoriaDetalle />}
            />
            <Route path="/sprints" element={<SprintList />} />
            <Route path="/sprints/:idSprint" element={<SprintDetail />} />
            <Route path="/kanban" element={<Suspense fallback={<LazyFallback />}><SprintBoard /></Suspense>} />
            <Route path="/metricas" element={<Suspense fallback={<LazyFallback />}><Metricas /></Suspense>} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/notificaciones" element={<Suspense fallback={<LazyFallback />}><Notificaciones /></Suspense>} />
            <Route path="/unirse-proyecto" element={<UnirseProyecto />} />
            <Route path="/lista-usuarios" element={<ListaUsuarios />} />
            <Route path="/projects/:id/members" element={<ListaUsuarios />} />
            <Route path="/projects/:id/documents" element={<Suspense fallback={<LazyFallback />}><DocumentosProyectoPage /></Suspense>} />
            <Route
              path="/detalles_de_proyecto/:id"
              element={<DetallesDeProyecto />}
            />
            <Route path="/metricas/:id" element={<Suspense fallback={<LazyFallback />}><ProjectMetrics /></Suspense>} />
          </Route>
        </Route>

        {/* 🔁 FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
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
