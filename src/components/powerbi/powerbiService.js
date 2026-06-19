import axios from 'axios';

// Configuración de la URL base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/powerbi';
const API_KEY = import.meta.env.VITE_POWERBI_API_KEY;

// Crear instancia de axios con configuración por defecto
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Manejador de errores global
const handleError = (error) => {
  console.error('Error en PowerBI Service:', error);
  
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    throw new Error(`Error ${error.response.status}: ${error.response.data?.message || 'Error en el servidor'}`);
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    throw new Error('No se recibió respuesta del servidor');
  } else {
    // Algo sucedió al configurar la solicitud
    throw new Error(error.message || 'Error desconocido');
  }
};

// Servicio PowerBI
const powerbiService = {
  /**
   * Obtiene la lista de proyectos
   * @returns {Promise<Array>} Lista de proyectos
   */
  getProyectos: async () => {
    try {
      const response = await apiClient.get('/proyectos');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Obtiene la lista de sprints
   * @returns {Promise<Array>} Lista de sprints
   */
  getSprints: async () => {
    try {
      const response = await apiClient.get('/sprints');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Obtiene la lista de épicas
   * @returns {Promise<Array>} Lista de épicas
   */
  getEpicas: async () => {
    try {
      const response = await apiClient.get('/epicas');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Obtiene la lista de historias de usuario
   * @returns {Promise<Array>} Lista de historias
   */
  getHistorias: async () => {
    try {
      const response = await apiClient.get('/historias');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Obtiene la lista de tareas
   * @returns {Promise<Array>} Lista de tareas
   */
  getTareas: async () => {
    try {
      const response = await apiClient.get('/tareas');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Obtiene la lista de usuarios
   * @returns {Promise<Array>} Lista de usuarios
   */
  getUsuarios: async () => {
    try {
      const response = await apiClient.get('/usuarios');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Obtiene todos los datos de forma paralela
   * @returns {Promise<Object>} Objeto con todos los datos
   */
  getAllData: async () => {
    try {
      const [proyectos, sprints, epicas, historias, tareas, usuarios] = await Promise.all([
        apiClient.get('/proyectos'),
        apiClient.get('/sprints'),
        apiClient.get('/epicas'),
        apiClient.get('/historias'),
        apiClient.get('/tareas'),
        apiClient.get('/usuarios'),
      ]);

      return {
        proyectos: proyectos.data,
        sprints: sprints.data,
        epicas: epicas.data,
        historias: historias.data,
        tareas: tareas.data,
        usuarios: usuarios.data,
      };
    } catch (error) {
      handleError(error);
    }
  },
};

export default powerbiService;
