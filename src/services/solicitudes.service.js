import API_URL from "./api";
import { buildUnauthenticatedError, getAccessToken } from "./auth.service";

const parseError = async (response, fallbackMessage) => {
  try {
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    return body.message || body.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const request = async (path, options = {}, fallbackMessage) => {
  const token = getAccessToken();

  if (!token) {
    throw buildUnauthenticatedError();
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMessage = await parseError(response, fallbackMessage);

    if (response.status === 401) {
      throw buildUnauthenticatedError(errorMessage);
    }

    throw new Error(errorMessage);
  }

  return response.json();
};

export const crearSolicitudIngreso = async ({
  idProyecto,
  mensajeOpcional,
}) => {
  return request(
    "/solicitudes",
    {
      method: "POST",
      body: JSON.stringify({
        id_proyecto: idProyecto,
        mensaje_opcional: mensajeOpcional || "",
      }),
    },
    "Error al crear la solicitud",
  );
};

export const listarSolicitudesUsuario = async () => {
  return request("/solicitudes", {}, "Error al cargar tus solicitudes");
};

export const listarSolicitudesPendientesPorProyecto = async (proyectoId) => {
  try {
    const token = getAccessToken();

    if (!token) {
      throw buildUnauthenticatedError();
    }

    const response = await fetch(
      `${API_URL}/solicitudes/pendientes?proyecto=${encodeURIComponent(proyectoId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorMessage = await parseError(response, "Error al cargar las solicitudes pendientes");

      if (response.status === 401) {
        throw buildUnauthenticatedError(errorMessage);
      }

      // Si es 403 (sin permisos), devolver un objeto con array vacío en lugar de lanzar error
      if (response.status === 403) {
        return { success: true, data: [], message: "No tienes permisos para ver solicitudes pendientes" };
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Si el error es por falta de permisos, devolver array vacío
    if (error.message === "Sin permisos" || error.message?.includes("403")) {
      return { success: true, data: [], message: "No tienes permisos para ver solicitudes pendientes" };
    }
    throw error;
  }
};

export const aprobarSolicitud = async ({ idSolicitud, idRol }) => {
  return request(
    `/solicitudes/${idSolicitud}/aprobar`,
    {
      method: "POST",
      body: JSON.stringify({ id_rol: Number(idRol) }),
    },
    "Error al aprobar la solicitud",
  );
};

export const rechazarSolicitud = async ({ idSolicitud, motivo }) => {
  return request(
    `/solicitudes/${idSolicitud}/rechazar`,
    {
      method: "POST",
      body: JSON.stringify({ motivo: motivo || "" }),
    },
    "Error al rechazar la solicitud",
  );
};

export const cancelarSolicitud = async ({ idSolicitud, motivo }) => {
  return request(
    `/solicitudes/${idSolicitud}/cancelar`,
    {
      method: "POST",
      body: JSON.stringify({ motivo: motivo || "" }),
    },
    "Error al cancelar la solicitud",
  );
};
