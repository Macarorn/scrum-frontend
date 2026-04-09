import { useEffect, useState } from 'react'
import { Alert, Card, Col, Container, Row, Spinner } from 'react-bootstrap'
import { listarProyectos } from '../../services/proyectos.service'
import '../../styles/ProyectosOverview.css'

export default function ProyectosOverview() {
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const response = await listarProyectos()
        setProyectos(response.data || [])
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los proyectos')
      } finally {
        setLoading(false)
      }
    }

    cargarProyectos()
  }, [])

  return (
    <div className="projects-overview-page">
      <Container className="py-4">
        <h1 className="projects-title">Proyectos</h1>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        )}

        {error && !loading && (
          <Alert variant="danger" role="alert">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Row className="g-4">
            {proyectos.map((proyecto) => (
              <Col key={proyecto.id_proyecto} xs={12} sm={6} md={4} lg={3}>
                <Card className="project-card h-100">
                  <Card.Body>
                    <Card.Title className="project-name">{proyecto.nombre}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {!loading && !error && proyectos.length === 0 && (
          <Alert variant="info" role="alert">
            Aún no hay proyectos creados.
          </Alert>
        )}
      </Container>
    </div>
  )
}
