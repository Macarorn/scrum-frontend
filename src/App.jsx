import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import CrearProyecto from './pages/Proyectos/CrearProyecto'
import CrearProyectoForm from './pages/Proyectos/CrearProyectoForm'
import ProyectosOverview from './pages/Proyectos/ProyectosOverview'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/crear-proyecto" element={<CrearProyecto />} />
        <Route path="/crear-proyecto-form" element={<CrearProyectoForm />} />
        <Route path="/proyectos" element={<ProyectosOverview />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
