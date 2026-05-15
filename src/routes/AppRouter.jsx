import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import PerfilUsuario from "../pages/PerfilUsuario";
import ProyectosOverview from "../pages/Proyectos/ProyectosOverview";
import DetallesDeProyecto from "../pages/detalles_de_proyecto";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
        <Route path="/proyectos" element={<ProyectosOverview />} />
        <Route path="/detalles_de_proyecto/:id" element={<DetallesDeProyecto />} />
      </Routes>
    </BrowserRouter>
  );
}