import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrumTrackLoader from "../components/ScrumTrackLoader";

// Lazy load components
const Login = React.lazy(() => import("../components/Login"));
const Register = React.lazy(() => import("../components/Register"));
const PerfilUsuario = React.lazy(() => import("../pages/PerfilUsuario/PerfilUsuario"));
const ProyectosOverview = React.lazy(() => import("../pages/Proyectos/ProyectosOverview"));
const DetallesDeProyecto = React.lazy(() => import("../pages/DetallesProyecto/DetallesProyecto"));
const ListaUsuarios = React.lazy(() => import("../pages/ListaUsuarios/ListaUsuarios"));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<ScrumTrackLoader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/perfil" element={<PerfilUsuario />} />
          <Route path="/proyectos" element={<ProyectosOverview />} />
          <Route path="/detalles_de_proyecto/:id" element={<DetallesDeProyecto />} />
          <Route path="/lista-usuarios" element={<ListaUsuarios />} />
          <Route path="/projects/:id/members" element={<ListaUsuarios />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}