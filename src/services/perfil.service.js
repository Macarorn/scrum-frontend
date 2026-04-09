const API_BASE_URL = "http://localhost:3000/api";

const getToken = () => {
  return localStorage.getItem("token");
};

export const obtenerPerfil = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No autenticado. Por favor, inicia sesión");
  }

  const response = await fetch(`${API_BASE_URL}/perfil`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al cargar el perfil");
  }

  return await response.json();
};