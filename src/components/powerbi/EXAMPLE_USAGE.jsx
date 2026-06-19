/**
 * EJEMPLOS DE USO - Dashboard Power BI
 * 
 * Este archivo muestra diferentes formas de integrar y usar el Dashboard
 */

// ============================================================================
// EJEMPLO 1: Integración básica en App.jsx
// ============================================================================

// app-example-1.jsx
import React from 'react';
import DashboardPowerBI from './components/powerbi/DashboardPowerBI';

function App() {
  return (
    <div className="app">
      <DashboardPowerBI />
    </div>
  );
}

export default App;


// ============================================================================
// EJEMPLO 2: Con sistema de rutas (React Router)
// ============================================================================

// app-example-2.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DashboardPowerBI from './components/powerbi/DashboardPowerBI';

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            📊 Scrum Dashboard
          </Link>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard-powerbi">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/dashboard-powerbi" element={<DashboardPowerBI />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

function Home() {
  return (
    <div className="container mt-5">
      <h1>Bienvenido</h1>
      <p>Accede al <Link to="/dashboard-powerbi">Dashboard de Power BI</Link></p>
    </div>
  );
}

export default App;


// ============================================================================
// EJEMPLO 3: Con Lazy Loading (carga en demanda)
// ============================================================================

// app-example-3.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

// Importar con lazy loading
const DashboardPowerBI = lazy(() => import('./components/powerbi/DashboardPowerBI'));

// Componente de carga
function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard-powerbi" element={<DashboardPowerBI />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;


// ============================================================================
// EJEMPLO 4: Con tema personalizado (usando context)
// ============================================================================

// ThemeContext.jsx
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// app-example-4.jsx
import React, { useContext } from 'react';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import DashboardPowerBI from './components/powerbi/DashboardPowerBI';

function AppContent() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }}>
      <DashboardPowerBI />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;


// ============================================================================
// EJEMPLO 5: Uso del servicio en otro componente
// ============================================================================

// components/CustomComponent.jsx
import React, { useState, useEffect } from 'react';
import powerbiService from './powerbi/powerbiService';
import { Alert, Spinner } from 'react-bootstrap';

function CustomComponent() {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await powerbiService.getProyectos();
      setProyectos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2>Proyectos ({proyectos.length})</h2>
      <ul>
        {proyectos.map((proyecto) => (
          <li key={proyecto.id}>{proyecto.nombre}</li>
        ))}
      </ul>
    </div>
  );
}

export default CustomComponent;


// ============================================================================
// EJEMPLO 6: Implementar caché de datos
// ============================================================================

// hooks/usePowerBIData.js
import { useState, useEffect, useCallback } from 'react';
import powerbiService from '../components/powerbi/powerbiService';

const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutos
let dataCache = {
  data: null,
  timestamp: null,
};

export function usePowerBIData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar caché
      if (!forceRefresh && dataCache.data && Date.now() - dataCache.timestamp < CACHE_EXPIRY_TIME) {
        setData(dataCache.data);
        setLoading(false);
        return;
      }

      // Cargar datos
      const allData = await powerbiService.getAllData();
      dataCache = {
        data: allData,
        timestamp: Date.now(),
      };
      setData(allData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: () => loadData(true) };
}

// Uso en componente:
function MyComponent() {
  const { data, loading, error, refetch } = usePowerBIData();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Actualizar</button>
      {/* Mostrar datos */}
    </div>
  );
}


// ============================================================================
// EJEMPLO 7: Con notificaciones (react-toastify)
// ============================================================================

// components/DashboardWithNotifications.jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DashboardPowerBI from './powerbi/DashboardPowerBI';
import powerbiService from './powerbi/powerbiService';

function DashboardWithNotifications() {
  useEffect(() => {
    const checkData = async () => {
      try {
        const data = await powerbiService.getAllData();
        
        if (data.tareas.length === 0) {
          toast.warning('No hay tareas creadas');
        }
        
        if (data.proyectos.length === 0) {
          toast.error('No hay proyectos disponibles');
        } else {
          toast.success('Dashboard cargado correctamente');
        }
      } catch (err) {
        toast.error(`Error: ${err.message}`);
      }
    };

    checkData();
  }, []);

  return <DashboardPowerBI />;
}

export default DashboardWithNotifications;


// ============================================================================
// EJEMPLO 8: Filtros avanzados
// ============================================================================

// components/DashboardWithFilters.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import DashboardPowerBI from './powerbi/DashboardPowerBI';
import powerbiService from './powerbi/powerbiService';

function DashboardWithFilters() {
  const [selectedProject, setSelectedProject] = useState('all');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProyectos();
  }, []);

  const loadProyectos = async () => {
    try {
      const data = await powerbiService.getProyectos();
      setProyectos(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (projectId) => {
    setSelectedProject(projectId);
    // Aquí implementarías la lógica para filtrar datos
  };

  if (loading) return <div>Cargando proyectos...</div>;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col md={6}>
          <h2>Dashboard Filtrado</h2>
        </Col>
        <Col md={6}>
          <Form.Select value={selectedProject} onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="all">Todos los proyectos</option>
            {proyectos.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      
      <DashboardPowerBI key={selectedProject} />
    </Container>
  );
}

export default DashboardWithFilters;


// ============================================================================
// EJEMPLO 9: Exportar datos a CSV
// ============================================================================

// utils/exportData.js
export function exportToCSV(data, filename) {
  const headers = Object.keys(data[0] || {});
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
}

// Uso en componente:
import { exportToCSV } from './utils/exportData';
import powerbiService from './powerbi/powerbiService';

async function handleExport() {
  const data = await powerbiService.getTareas();
  exportToCSV(data, 'tareas');
}


// ============================================================================
// EJEMPLO 10: Estructura recomendada con todas las mejores prácticas
// ============================================================================

// App.jsx (recomendado)
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const DashboardPowerBI = lazy(() => import('./components/powerbi/DashboardPowerBI'));

function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand">📊 Scrum Dashboard</span>
        </div>
      </nav>

      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPowerBI />} />
          <Route path="/" element={<DashboardPowerBI />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
