import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";

import AppShell from "./components/AppShell";
import Login from "./components/Login";
import Register from "./components/Register";
import Backlog from "./pages/Backlog/Backlog";
import EpicaDetalle from "./pages/Epicas/EpicaDetalle";
import EpicasOverview from "./pages/Epicas/EpicasOverview";
import HistoriaDetalle from "./pages/Historias/HistoriaDetalle";
import LandingPage from "./components/LandingPage";

import PublicLayout from "./components/PublicLayout";
import LandingLayout from "./components/LandingLayout";
import RequireAuth from "./components/RequireAuth";
import AccessDenied from "./components/AccessDenied";
import PerfilUsuario from "./pages/PerfilUsuario";
import CrearProyecto from "./pages/Proyectos/CrearProyecto";
import CrearProyectoForm from "./pages/Proyectos/CrearProyectoForm";
import ProyectosOverview from "./pages/Proyectos/ProyectosOverview";
import UnirseProyecto from "./pages/Proyectos/UnirseProyecto";
import SprintBoard from "./pages/Sprints/SprintBoard";
import SprintDetail from "./pages/Sprints/SprintDetail";
import SprintList from "./pages/Sprints/SprintList";

import { getAccessToken, subscribeAuthChanges } from "./services/auth.service";
import DetallesDeProyecto from "./pages/detalles_de_proyecto";

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
        </Route>

        {/* 🔓 LANDING PAGE CON NAVBAR */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
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
            <Route path="/epicas/:idEpica" element={<EpicaDetalle />} />
            <Route
              path="/historias/:idHistoria"
              element={<HistoriaDetalle />}
            />
            <Route path="/sprints" element={<SprintList />} />
            <Route path="/sprints/:idSprint" element={<SprintDetail />} />
            <Route path="/kanban" element={<SprintBoard />} />
            <Route path="/unirse-proyecto" element={<UnirseProyecto />} />
            <Route
              path="/detalles_de_proyecto/:id"
              element={<DetallesDeProyecto />}
            />
          </Route>
        </Route>

        {/* 🔁 FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
