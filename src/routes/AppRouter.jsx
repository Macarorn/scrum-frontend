import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import PerfilUsuario from "../pages/PerfilUsuario/PerfilUsuario";
import ProyectosOverview from "../pages/Proyectos/ProyectosOverview";
import DetallesDeProyecto from "../pages/DetallesProyecto/DetallesProyecto";
import ListaUsuarios from "../pages/ListaUsuarios/ListaUsuarios";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={<PerfilUsuario />} />
        <Route path="/proyectos" element={<ProyectosOverview />} />
        <Route path="/detalles_de_proyecto/:id" element={<DetallesDeProyecto />} />
        <Route path="/lista-usuarios" element={<ListaUsuarios />} />
        <Route path="/projects/:id/members" element={<ListaUsuarios />} />
      </Routes>
    </BrowserRouter>
  );
}