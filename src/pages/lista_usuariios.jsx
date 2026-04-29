import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useRef } from "react";
import "../assets/detalles_de_proyecto.css";
import API_URL from "../services/api";
import { getAccessToken } from "../services/auth.service";

const ALL_USERS = [
  {
    id: 1,
    name: "Kathryn Murphy",
    email: "nevaeh.simmons@example.com",
    role: "Product Owner",
    status: "Activo",
    joinDate: "Mar 23, 2013",
  },
  {
    id: 2,
    name: "Savannah Nguyen",
    email: "debbie.baker@example.com",
    role: "Scrum Master",
    status: "Inactivo",
    joinDate: "Oct 24, 2018",
  },
  {
    id: 3,
    name: "Dianne Russell",
    email: "felicia.reid@example.com",
    role: "Developer",
    status: "Activo",
    joinDate: "Aug 7, 2017",
  },
  {
    id: 4,
    name: "Esther Howard",
    email: "jackson.graham@example.com",
    role: "Developer",
    status: "Removido",
    joinDate: "Apr 28, 2016",
  },
  {
    id: 5,
    name: "Jenny Wilson",
    email: "debra.holt@example.com",
    role: "QA",
    status: "Activo",
    joinDate: "May 6, 2012",
  },

  // 🔥 NUEVOS PARA PROBAR
  {
    id: 6,
    name: "Carlos Pérez",
    email: "carlos.perez@example.com",
    role: "Developer",
    status: "Activo",
    joinDate: "Jan 10, 2022",
  },
  {
    id: 7,
    name: "Laura Gómez",
    email: "laura.gomez@example.com",
    role: "QA",
    status: "Activo",
    joinDate: "Feb 14, 2023",
  },
  {
    id: 8,
    name: "Miguel Torres",
    email: "miguel.torres@example.com",
    role: "Scrum Master",
    status: "Inactivo",
    joinDate: "Jul 9, 2021",
  },
];

const STATUS_BADGE = {
  Activo: "success",
  Inactivo: "warning",
  Removido: "danger",
};

const PAGE_SIZE = 10;

// Función para obtener las iniciales del nombre
const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Función para obtener color de avatar basado en iniciales
const getAvatarColor = (name) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];
  const charCode = name.charCodeAt(0);
  return colors[charCode % colors.length];
};

const ListaUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState(ALL_USERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchAdd, setSearchAdd] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const addPanelRef = useRef(null);
  const addButtonRef = useRef(null);

  // Determinar id de proyecto desde querystring (fallback 1)
  const projectId =
    new URLSearchParams(window.location.search).get("id_proyecto") ||
    new URLSearchParams(window.location.search).get("id") ||
    "1";

  // Cargar datos desde el backend al montar: miembros del proyecto, todos los usuarios (para añadir) y roles
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1) Intentar obtener proyecto para leer miembros (si la API devuelve equipo/miembros)
        let miembros = [];
        try {
          const resProyecto = await fetch(`${API_URL}/proyectos/${projectId}`, { headers });
          if (resProyecto.ok) {
            const bodyProyecto = await resProyecto.json();
            const proyecto = bodyProyecto?.data || bodyProyecto || {};
            miembros = proyecto.equipo || proyecto.miembros || proyecto.integrantes || proyecto.usuarios || proyecto.miembros_equipo || [];
          } else {
            // no hay miembros en proyecto o proyecto inaccesible — seguimos al fallback
            console.warn("No se pudo obtener proyecto o no incluye miembros:", resProyecto.status);
          }
        } catch (err) {
          console.warn("Error consultando proyecto:", err.message);
        }

        // 2) Si no obtuvimos miembros desde el proyecto, pedir todos los usuarios y usarlos como miembros (fallback)
        if (!Array.isArray(miembros) || miembros.length === 0) {
          const res = await fetch(`${API_URL}/usuarios`, { headers });
          if (!res.ok) throw new Error(`Error cargando usuarios: ${res.status}`);
          const body = await res.json();
          const rows = body?.data || body || [];
          miembros = rows;
        }

        // Mapear miembros a la forma de la UI
        const mappedMembers = (miembros || []).map((u) => ({
          id: u.id_usuario || u.id || (u.usuario && u.usuario.id_usuario),
          name: u.nombre || u.nombre_completo || (u.usuario && u.usuario.nombre) || u.name,
          email: u.email || (u.usuario && u.usuario.email) || "",
          role: u.rol_principal || (u.roles && u.roles[0]?.nombre_rol) || u.nombre_rol || "Developer",
          status: u.activo || (u.usuario && u.usuario.activo) ? "Activo" : "Inactivo",
          joinDate: u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString("es-ES") : "",
        }));

        setUsers(mappedMembers);

        // 3) Intentar cargar la lista completa de usuarios para el panel "Añadir miembro"
        try {
          const resAll = await fetch(`${API_URL}/usuarios`, { headers });
          if (resAll.ok) {
            const bodyAll = await resAll.json();
            const rowsAll = bodyAll?.data || bodyAll || [];
            const mappedAll = (rowsAll || []).map((u) => ({
              id: u.id_usuario || u.id,
              name: u.nombre || u.nombre_completo || u.name,
              email: u.email,
              role: u.rol_principal || (u.roles && u.roles[0]?.nombre_rol) || "Developer",
              status: u.activo ? "Activo" : "Inactivo",
              joinDate: u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString("es-ES") : "",
            }));
            setAllUsers(mappedAll);
          } else {
            // fallback a maqueta si no se puede cargar
            setAllUsers(ALL_USERS);
          }
        } catch (err) {
          setAllUsers(ALL_USERS);
        }
      } catch (err) {
        // fallback general
        setUsers(ALL_USERS.slice(0, 5));
        setAllUsers(ALL_USERS);
        console.warn("No se pudieron cargar usuarios desde la API, usando datos locales:", err.message);
      }
    };

    cargarDatos();
  }, [projectId]);

  // Cerrar panel de "Añadir Miembro" al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!showAddPanel) return;
      if (addPanelRef.current && addPanelRef.current.contains(e.target)) return;
      if (addButtonRef.current && addButtonRef.current.contains(e.target)) return;
      setShowAddPanel(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAddPanel]);

  // Ocultar toast de éxito automáticamente
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  // Cargar roles (para el select) en segundo plano
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/roles`, { headers });
        if (!res.ok) throw new Error(`Error cargando roles: ${res.status}`);
        const body = await res.json();
        const rows = body?.data || body || [];
        setRoles(rows);
        if (!selectedRole && rows.length > 0) setSelectedRole(String(rows[0].id_rol));
      } catch (err) {
        console.warn("No se pudieron cargar roles desde la API:", err.message);
      }
    };

    cargarRoles();
  }, []);

  // Recargar lista completa de usuarios cada vez que se abre el panel "Añadir Miembro"
  useEffect(() => {
    if (!showAddPanel) return;

    const fetchAllUsers = async () => {
      try {
        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const resAll = await fetch(`${API_URL}/usuarios`, { headers });
        if (resAll.ok) {
          const bodyAll = await resAll.json();
          const rowsAll = bodyAll?.data || bodyAll || [];
          const mappedAll = (rowsAll || []).map((u) => ({
            id: u.id_usuario || u.id,
            name: u.nombre || u.nombre_completo || u.name,
            email: u.email,
            role: u.rol_principal || (u.roles && u.roles[0]?.nombre_rol) || "Developer",
            status: u.activo ? "Activo" : "Inactivo",
            joinDate: u.fecha_registro ? new Date(u.fecha_registro).toLocaleDateString("es-ES") : "",
          }));
          setAllUsers(mappedAll);
        }
      } catch (err) {
        // no bloquear la UI si falla
      }
    };

    fetchAllUsers();
  }, [showAddPanel]);

  // Usuarios disponibles para añadir (todos los usuarios menos los ya miembros)
  const availableUsers = allUsers.filter((u) => !users.some((m) => m.id === u.id));
  const filteredAvailable = availableUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchAdd.toLowerCase()) ||
      u.email.toLowerCase().includes(searchAdd.toLowerCase())
  );
  // Filtro y paginación
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleActionMenu = (id) => {
    setActionMenu(actionMenu === id ? null : id);
  };
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDeleteUser = (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    setDeleteConfirm(user);
    setActionMenu(null);
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm) return;
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/proyectos/${projectId}/miembros/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        let errMsg = `Error ${res.status}`;
        try {
          const body = await res.json();
          errMsg = body?.message || body?.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteConfirm.id));
      setSuccessMessage(`${deleteConfirm.name} eliminado del proyecto`);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setDeleteConfirm(null);
      setDuplicateAlert({ message: err.message || "Error al eliminar miembro" });
    }
  };

  const openModal = (user) => {
    const exists = users.find((u) => u.id === user.id);
    // Guardar el usuario seleccionado para poder reabrir el modal después
    setSelectedUser(user);
    if (exists) {
      // Si ya es miembro, cerrar/evitar abrir el modal de asignar rol y mostrar alerta
      setShowModal(false);
      setDuplicateAlert({ name: exists.name, role: exists.role });
      return;
    }

    setSelectedRole(roles && roles.length > 0 ? String(roles[0].id_rol) : selectedRole || "");
    setShowModal(true);
  };

  const confirmAddUser = async () => {
    if (!selectedUser) return;
    // doble protección local contra duplicados
    if (users.some((u) => u.id === selectedUser.id)) {
      const exists = users.find((u) => u.id === selectedUser.id);
      setShowModal(false);
      setDuplicateAlert({ name: exists.name, role: exists.role });
      return;
    }
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/proyectos/${projectId}/unirse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          usuarioId: selectedUser.id,
          rol: selectedRole,
        }),
      });

      if (!res.ok) {
        // intentar leer mensaje de error
        let errMsg = `Error ${res.status}`;
        try {
          const body = await res.json();
          errMsg = body?.message || body?.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      // Añadir visualmente al miembro
      const roleName = roles.find((r) => String(r.id_rol) === String(selectedRole))?.nombre_rol || selectedRole;
      setUsers((prev) => [
        ...prev,
        {
          ...selectedUser,
          role: roleName,
          status: "Activo",
        },
      ]);

      // Mostrar mensaje de éxito y cerrar panel
      setSuccessMessage(`${selectedUser.name} agregado al proyecto`);
      setShowModal(false);
      setShowAddPanel(false);
    } catch (err) {
      console.error(err);
      // Cerrar modal de asignar rol y mostrar mensaje de error estilizado
      setShowModal(false);
      setDuplicateAlert({ message: err.message || "Error al añadir miembro" });
    }
  };

  // UI
  return (
    <div className="detalles-container">
      {/* Success toast */}
      {successMessage && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1200 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
              <strong className="me-auto">Éxito</strong>
              <button type="button" className="btn-close" aria-label="Close" onClick={() => setSuccessMessage(null)}></button>
            </div>
            <div className="toast-body">{successMessage}</div>
          </div>
        </div>
      )}
      <main className="main-container">
        {/* HEADER */}
        <div className="page-header">
          <h1>Miembros del proyecto</h1>
        </div>

        <div className="project-card">
          {/* HEADER CON BUSCADOR Y BOTÓN */}
          <div className="bg-white px-4 py-3 border-bottom d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-4">
              <div className="d-flex align-items-center gap-2">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#e6f4ea",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="bx bx-group" style={{ color: "#2e7d32" }}></i>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6c757d" }}>Miembros</div>
                  <div style={{ fontWeight: "bold", fontSize: 18 }}>{total}</div>
                </div>
              </div>

              <div style={{ fontSize: 14, color: "#6c757d" }}>
                Total de miembros del proyecto
              </div>
            </div>

            <div
              className="d-flex align-items-center gap-2"
              style={{ position: "relative" }}
            >
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Buscar usuario..."
                  style={{
                    padding: "0 12px 0 35px",
                    borderRadius: 10,
                    width: 240,
                    height: 40,
                  }}
                  value={search}
                  onChange={handleSearch}
                />
                <i
                  className="bx bx-search"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 10,
                    transform: "translateY(-50%)",
                    color: "#999",
                  }}
                ></i>
              </div>

              <button
                className="btn"
                ref={addButtonRef}
                onClick={() => setShowAddPanel((s) => !s)}
                style={{
                  backgroundColor: "#2e7d32",
                  color: "white",
                  borderRadius: 10,
                  height: 40,
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i className="bx bx-plus"></i> Añadir Miembro
              </button>

              {/* 🔥 PANEL CORRECTO */}
              {showAddPanel && (
                <div
                  ref={addPanelRef}
                  className="bg-white border rounded shadow-sm p-3"
                  style={{
                    position: "absolute",
                    top: "120%",
                    right: 0,
                    width: 320,
                    zIndex: 999,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* INPUT */}
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Buscar por nombre o correo..."
                    value={searchAdd}
                    onChange={(e) => setSearchAdd(e.target.value)}
                    style={{
                      borderRadius: 10,
                      height: 40,
                    }}
                  />

                  {/* LISTA */}
                  <div style={{ maxHeight: 250, overflowY: "auto" }}>
                    {filteredAvailable.map((user) => (
                      <div
                        key={user.id}
                        className="d-flex justify-content-between align-items-center p-2"
                        style={{
                          borderRadius: 8,
                          transition: "0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <div>
                          <div className="fw-semibold" style={{ fontSize: 14 }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: 12, color: "#6c757d" }}>
                            {user.email}
                          </div>
                        </div>

                        <button
                          onClick={() => openModal(user)}
                          style={{
                            backgroundColor: "#e6f4ea",
                            color: "#2e7d32",
                            border: "1px solid #c8e6c9",
                            borderRadius: 20,
                            padding: "4px 12px",
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Añadir
                        </button>
                      </div>
                    ))}

                    {filteredAvailable.length === 0 && (
                      <div className="text-center text-muted small mt-2">
                        No se encontraron más usuarios
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* TABLA DE USUARIOS */}
          {paginatedUsers.length > 0 ? (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: "35%" }}>
                      Nombre
                    </th>
                    <th scope="col" style={{ width: "25%" }}>
                      Correo
                    </th>
                    <th scope="col" style={{ width: "15%" }}>
                      Rol
                    </th>
                    <th scope="col" style={{ width: "15%" }}>
                      Estado
                    </th>
                    <th scope="col" style={{ width: "15%" }}>
                      Fecha de ingreso
                    </th>
                    <th scope="col" style={{ width: "10%", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: "1px solid #e9ecef",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8f9fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              backgroundColor: getAvatarColor(user.name),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "bold",
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="fw-semibold">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td className="fw-semibold">{user.role}</td>
                      <td>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 500,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            backgroundColor:
                              user.status === "Activo"
                                ? "#e6f4ea"
                                : user.status === "Inactivo"
                                ? "#fff4e5"
                                : user.status === "En espera"
                                ? "#e3f2fd"
                                : "#fdecea",
                            color:
                              user.status === "Activo"
                                ? "#2e7d32"
                                : user.status === "Inactivo"
                                ? "#ed6c02"
                                : user.status === "En espera"
                                ? "#1976d2"
                                : "#d32f2f",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor:
                                user.status === "Activo"
                                  ? "#2e7d32"
                                  : user.status === "Inactivo"
                                  ? "#ed6c02"
                                  : user.status === "En espera"
                                  ? "#1976d2"
                                  : "#d32f2f",
                            }}
                          ></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="text-muted small">{user.joinDate}</td>
                      <td style={{ position: "relative", textAlign: "center" }}>
                        <button
                          className="btn btn-link text-dark p-0"
                          style={{ fontSize: 20 }}
                          onClick={() => handleActionMenu(user.id)}
                          title="Opciones"
                        >
                          <i className="bx bx-dots-vertical-rounded"></i>
                        </button>
                        {actionMenu === user.id && (
                          <div
                            className="shadow-sm rounded bg-white border position-absolute"
                            style={{
                              right: 0,
                              minWidth: 160,
                              zIndex: 10,
                              top: "100%",
                            }}
                          >
                            <button
                              className="dropdown-item"
                              onClick={() => setActionMenu(null)}
                              style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 16px",
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                fontSize: 14,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#f8f9fa")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <i className="bx bx-user me-2"></i> Ver perfil
                            </button>
                            <hr
                              style={{
                                margin: "4px 0",
                                border: "none",
                                borderTop: "1px solid #e9ecef",
                              }}
                            />
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleDeleteUser(user.id)}
                              style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 16px",
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                fontSize: 14,
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#ffe5e5")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <i className="bx bx-trash me-2"></i> Eliminar usuario
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i
                className="bx bx-inbox"
                style={{ fontSize: 48, color: "#ccc" }}
              ></i>
              <p className="text-muted mt-3">No hay miembros que mostrar</p>
            </div>
          )}

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-light border-top">
              <div className="text-muted small">
                Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, total)}-
                {Math.min(page * PAGE_SIZE, total)} de {total}
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              width: 400,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h5 style={{ marginBottom: 15 }}>Asignar rol</h5>

            {/* Usuario */}
            <div style={{ marginBottom: 15 }}>
              <strong>{selectedUser?.name}</strong>
              <div style={{ fontSize: 12, color: "#6c757d" }}>
                {selectedUser?.email}
              </div>
            </div>

            {/* Select */}
            <select
              className="form-select mb-3"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roles && roles.length > 0 ? (
                roles.map((r) => (
                  <option key={r.id_rol} value={String(r.id_rol)}>
                    {r.nombre_rol}
                  </option>
                ))
              ) : (
                <>
                  <option value="3">Product Owner</option>
                  <option value="4">Scrum Master</option>
                  <option value="5">Developer</option>
                  <option value="2">QA</option>
                </>
              )}
            </select>

            {/* Botones */}
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-light"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>

              <button
                className="btn"
                style={{
                  backgroundColor: "#2e7d32",
                  color: "white",
                }}
                onClick={confirmAddUser}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {duplicateAlert && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 22,
              width: 480,
              maxWidth: "92%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              textAlign: "center",
            }}
          >
            {/* Título / mensaje principal */}
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {duplicateAlert.message || "Ya eres miembro de este proyecto"}
            </div>

            {/* Mensaje secundario o detalle */}
            {duplicateAlert.name ? (
              <div style={{ color: "#6c757d", marginBottom: 16 }}>
                <strong>{duplicateAlert.name}</strong>
                <div>Rol actual: {duplicateAlert.role || "-"}</div>
              </div>
            ) : (
              <div style={{ color: "#6c757d", marginBottom: 16 }}>
                {duplicateAlert.detail || ""}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <button
                className="btn"
                onClick={() => {
                  setDuplicateAlert(null);
                  if (selectedUser) setShowModal(true);
                }}
                style={{ backgroundColor: "#2e7d32", color: "white" }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 22,
              width: 480,
              maxWidth: "92%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              ¿Estás seguro de eliminar este miembro?
            </div>
            <div style={{ color: "#6c757d", marginBottom: 16 }}>
              <strong>{deleteConfirm.name}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <button className="btn btn-light" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button
                className="btn"
                onClick={confirmDeleteUser}
                style={{ backgroundColor: "#2e7d32", color: "white" }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bootstrap icons CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />
    </div>
  );
};

export default ListaUsuarios;
