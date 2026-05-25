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
import AppShell from "./components/AppShell";
import ScrumTrackLoader from "./components/ScrumTrackLoader";
import PublicLayout from "./components/PublicLayout";
import LandingLayout from "./components/LandingLayout";
import RequireAuth from "./components/RequireAuth";
import AccessDenied from "./components/AccessDenied";

const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const Backlog = lazy(() => import("./pages/Backlog/Backlog"));
const EpicaDetalle = lazy(() => import("./pages/Epicas/EpicaDetalle"));
const EpicaForm = lazy(() => import("./pages/Epicas/EpicaForm"));
const EpicasOverview = lazy(() => import("./pages/Epicas/EpicasOverview"));
const HistoriaDetalle = lazy(() => import("./pages/Historias/HistoriaDetalle"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const ScrumGuide = lazy(() => import("./components/ScrumGuide"));

const DetallesDeProyecto = lazy(() => import("./pages/DetallesProyecto/DetallesProyecto"));
const Notificaciones = lazy(() => import("./pages/Notificaciones/Notificaciones"));
const PerfilUsuario = lazy(() => import("./pages/PerfilUsuario/PerfilUsuario"));
const CrearProyecto = lazy(() => import("./pages/Proyectos/CrearProyecto"));
const CrearProyectoForm = lazy(() => import("./pages/Proyectos/CrearProyectoForm"));
const ProyectosOverview = lazy(() => import("./pages/Proyectos/ProyectosOverview"));
const UnirseProyecto = lazy(() => import("./pages/Proyectos/UnirseProyecto"));
const SprintBoard = lazy(() => import("./pages/Sprints/SprintBoard"));
const SprintDetail = lazy(() => import("./pages/Sprints/SprintDetail"));
const SprintList = lazy(() => import("./pages/Sprints/SprintList"));

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
            <Route path="/sprints" element={<PageTransition><SprintList /></PageTransition>} />
            <Route path="/sprints/:idSprint" element={<PageTransition><SprintDetail /></PageTransition>} />
            <Route path="/kanban" element={<PageTransition><SprintBoard /></PageTransition>} />
            <Route path="/notificaciones" element={<PageTransition><Notificaciones /></PageTransition>} />
            <Route path="/unirse-proyecto" element={<PageTransition><UnirseProyecto /></PageTransition>} />
            <Route path="/lista-usuarios" element={<PageTransition><ListaUsuarios /></PageTransition>} />
            <Route path="/projects/:id/members" element={<PageTransition><ListaUsuarios /></PageTransition>} />
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
