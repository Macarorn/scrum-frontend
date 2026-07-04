import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

import API_BASE_URL from "./api.js";

export const obtenerPerfil = async () => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_BASE_URL}/perfil`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();

    if (response.status === 401) {
      throw buildUnauthenticatedError(
        error.message || "No autenticado. Por favor, inicia sesión",
      );
    }

    throw new Error(error.message || "Error al cargar el perfil");
  }

  return await response.json();
};
