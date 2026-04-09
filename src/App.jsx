import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import CrearProyecto from './pages/Proyectos/CrearProyecto'
import CrearProyectoForm from './pages/Proyectos/CrearProyectoForm'
import ProyectosOverview from './pages/Proyectos/ProyectosOverview'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CrearProyecto />} />
        <Route path="/crear-proyecto" element={<CrearProyecto />} />
        <Route path="/crear-proyecto-form" element={<CrearProyectoForm />} />
        <Route path="/proyectos" element={<ProyectosOverview />} />
        {/* <Route path="/unirse-proyecto" element={<div className="container py-5"><h1>Unirse a un Proyecto</h1><p>Aquí irá el formulario para unirse a un proyecto existente</p></div>} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
