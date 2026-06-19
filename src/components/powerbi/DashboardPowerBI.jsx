import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import powerbiService from './powerbiService';
import PowerBICharts from './PowerBICharts';
import './DashboardPowerBI.css';

/**
 * Componente Principal del Dashboard de Power BI
 * Carga datos del backend y muestra indicadores y gráficas
 */
const DashboardPowerBI = () => {
  const [data, setData] = useState({
    proyectos: [],
    sprints: [],
    epicas: [],
    historias: [],
    tareas: [],
    usuarios: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Cargar todos los datos del servicio PowerBI
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const allData = await powerbiService.getAllData();
      setData(allData);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del dashboard');
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recargar datos manualmente
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Renderizar tarjeta de métrica
  const MetricCard = ({ title, value, icon, variant = 'primary' }) => (
    <Col lg={2} md={4} sm={6} xs={12} className="mb-4">
      <Card className={`powerbi-metric-card border-${variant} h-100`}>
        <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
          <div className={`metric-icon text-${variant} mb-3`}>{icon}</div>
          <Card.Text className="text-muted small mb-2">{title}</Card.Text>
          <Card.Title className={`metric-value text-${variant}`}>{value}</Card.Title>
        </Card.Body>
      </Card>
    </Col>
  );

  if (loading && !data.proyectos.length) {
    return (
      <Container fluid className="powerbi-dashboard py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">Cargando dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="powerbi-dashboard py-4">
      {/* Header del Dashboard */}
      <div className="dashboard-header mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="mb-1">📊 Dashboard de Indicadores Scrum</h1>
            <p className="text-muted">Visualización de datos en tiempo real del proyecto</p>
          </div>
          <Button
            variant="primary"
            onClick={handleRefresh}
            disabled={refreshing}
            className="d-flex align-items-center gap-2"
          >
            {refreshing ? (
              <>
                <Spinner animation="border" size="sm" />
                Actualizando...
              </>
            ) : (
              <>
                🔄 Actualizar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <Alert.Heading>Error al cargar los datos</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Verifica que el backend esté corriendo en http://localhost:3000 y que el header
            x-api-key sea correcto.
          </p>
        </Alert>
      )}

      {/* Sección de Métricas Principales */}
      <section className="metrics-section mb-5">
        <h2 className="section-title mb-4">📈 Métricas Principales</h2>
        <Row>
          <MetricCard
            title="Proyectos"
            value={data.proyectos?.length || 0}
            icon="📁"
            variant="primary"
          />
          <MetricCard
            title="Sprints"
            value={data.sprints?.length || 0}
            icon="🎯"
            variant="info"
          />
          <MetricCard
            title="Épicas"
            value={data.epicas?.length || 0}
            icon="🏛️"
            variant="success"
          />
          <MetricCard
            title="Historias"
            value={data.historias?.length || 0}
            icon="📖"
            variant="warning"
          />
          <MetricCard
            title="Tareas"
            value={data.tareas?.length || 0}
            icon="✅"
            variant="danger"
          />
          <MetricCard
            title="Usuarios"
            value={data.usuarios?.length || 0}
            icon="👥"
            variant="secondary"
          />
        </Row>
      </section>

      {/* Sección de Gráficas */}
      <section className="charts-section">
        <h2 className="section-title mb-4">📉 Análisis Detallado</h2>
        <PowerBICharts data={data} loading={refreshing} error={error} />
      </section>

      {/* Footer */}
      <div className="dashboard-footer mt-5 pt-4 border-top text-center text-muted small">
        <p>
          Última actualización: {new Date().toLocaleString('es-ES')}
        </p>
        <p>
          Este es un módulo de demostración de indicadores antes de integrar Power BI embebido
        </p>
      </div>
    </Container>
  );
};

export default DashboardPowerBI;
