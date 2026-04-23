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
import LandingPage from "./components/LandingPage";

import PublicLayout from "./components/PublicLayout"; 
import PerfilUsuario from "./pages/PerfilUsuario";
import CrearProyecto from "./pages/Proyectos/CrearProyecto";
import CrearProyectoForm from "./pages/Proyectos/CrearProyectoForm";
import ProyectosOverview from "./pages/Proyectos/ProyectosOverview";
import UnirseProyecto from "./pages/Proyectos/UnirseProyecto";

import { getAccessToken, subscribeAuthChanges } from "./services/auth.service";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(getAccessToken())
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

        {/* 🔓 RUTAS PÚBLICAS CON NAVBAR */}
        <Route element={<PublicLayout />}>

          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/perfil" /> : <LandingPage />}
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
            path="/home" 
            element={<LandingPage />} 
          />

        </Route>

        {/* 🔐 RUTAS PROTEGIDAS */}
        <Route
          element={isAuthenticated ? <AppShell /> : <Navigate to="/login" />}
        >
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/crear-proyecto" element={<CrearProyecto />} />
          <Route path="/crear-proyecto-form" element={<CrearProyectoForm />} />
          <Route path="/proyectos" element={<ProyectosOverview />} />
          <Route path="/unirse-proyecto" element={<UnirseProyecto />} />
        </Route>

        {/* 🔁 FALLBACK */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/perfil" : "/login"} />}
        />

      </Routes>
    </Router>
  );
}

export default App;