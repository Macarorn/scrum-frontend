import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import './DashboardPowerBI.css';

/**
 * Componente de Gráficas de Power BI
 * Muestra el reporte Power BI embebido mediante iframe (Publish to Web)
 */
const PowerBICharts = () => {
  return (
    <div className="powerbi-charts-container">
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="powerbi-card h-100 shadow-sm border-0 overflow-hidden">
            <Card.Header className="bg-primary text-white border-0 py-3">
              <Card.Title className="mb-0 fw-bold">
                <i className="bi bi-bar-chart-fill me-2"></i>
                Dashboard de Métricas (Power BI)
              </Card.Title>
            </Card.Header>
            <Card.Body className="p-0" style={{ height: '600px', backgroundColor: '#f3f2f1' }}>
              <iframe 
                title="Dashboard Scrum Power BI" 
                width="100%" 
                height="100%" 
                src="https://app.powerbi.com/view?r=eyJrIjoiNGZkMWM0OTctMjhlMi00Zjc3LTg1OTYtMWNmNzUyNzg0NmY3IiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9" 
                frameBorder="0" 
                allowFullScreen={true}
                style={{ border: 'none' }}
              ></iframe>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PowerBICharts;
