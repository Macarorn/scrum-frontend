import React from 'react';
import { Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import PowerBIReport from './PowerBIReport';
import './DashboardPowerBI.css';

/**
 * Componente de Gráficas de Power BI
 * Muestra reportes Power BI embebidos en lugar de gráficos locales
 */
const PowerBICharts = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div className="powerbi-charts-container">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando gráficas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="powerbi-charts-container">
        <Alert variant="danger" dismissible>
          <Alert.Heading>Error al cargar las gráficas</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <Alert variant="info">
        No hay datos disponibles para mostrar las gráficas
      </Alert>
    );
  }

  return (
    <div className="powerbi-charts-container">
      <Row className="mb-4">
        <Col lg={6} md={12} className="mb-4">
          <Card className="powerbi-card h-100">
            <Card.Header className="bg-primary text-white">
              <Card.Title className="mb-0">Tareas por Estado</Card.Title>
            </Card.Header>
            <Card.Body style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PowerBIReport reportTitle="Tareas por Estado" />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} md={12} className="mb-4">
          <Card className="powerbi-card h-100">
            <Card.Header className="bg-success text-white">
              <Card.Title className="mb-0">Historias por Sprint</Card.Title>
            </Card.Header>
            <Card.Body style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PowerBIReport reportTitle="Historias por Sprint" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6} md={12} className="mb-4">
          <Card className="powerbi-card h-100">
            <Card.Header className="bg-warning text-dark">
              <Card.Title className="mb-0">Tareas por Asignado</Card.Title>
            </Card.Header>
            <Card.Body style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PowerBIReport reportTitle="Tareas por Asignado" />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} md={12} className="mb-4">
          <Card className="powerbi-card h-100">
            <Card.Header className="bg-danger text-white">
              <Card.Title className="mb-0">Épicas con Historias</Card.Title>
            </Card.Header>
            <Card.Body style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PowerBIReport reportTitle="Épicas con Historias" />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PowerBICharts;
