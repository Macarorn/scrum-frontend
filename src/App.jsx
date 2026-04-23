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
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/perfil" : "/login"} />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/perfil" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/perfil" /> : <Register />}
        />
        <Route
          element={isAuthenticated ? <AppShell /> : <Navigate to="/login" />}
        >
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/crear-proyecto" element={<CrearProyecto />} />
          <Route path="/crear-proyecto-form" element={<CrearProyectoForm />} />
          <Route path="/proyectos" element={<ProyectosOverview />} />
          <Route path="/backlog" element={<Backlog />} />
          <Route path="/epicas" element={<EpicasOverview />} />
          <Route path="/epicas/:idEpica" element={<EpicaDetalle />} />
          <Route path="/historias/:idHistoria" element={<HistoriaDetalle />} />
          <Route path="/sprints" element={<SprintList />} />
          <Route path="/sprints/:idSprint" element={<SprintDetail />} />
          <Route path="/kanban" element={<SprintBoard />} />
          <Route path="/unirse-proyecto" element={<UnirseProyecto />} />
          <Route path="/detalles_de_proyecto/:id" element={<DetallesDeProyecto />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/perfil" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;