const API_BASE_URL = 'http://localhost:3000/api'

// Obtener token del localStorage
const getToken = () => {
  return localStorage.getItem('token')
}

// Crear proyecto
export const crearProyecto = async (datos) => {
  const token = getToken()

  if (!token) {
    throw new Error('No autenticado. Por favor, inicia sesión')
  }

  const response = await fetch(`${API_BASE_URL}/proyectos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nombre: datos.nombre,
      tipo: datos.tipo,
      max_integrantes: datos.numIntegrantes
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Error al crear proyecto')
  }

  return await response.json()
}
