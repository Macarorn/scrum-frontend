import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import "../assets/detalles_de_proyecto.css";

const USERS = [
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
  const [users, setUsers] = useState(USERS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState(null);

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
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setActionMenu(null);
    setPage(1);
  };

  // UI
  return (
    <div className="detalles-container">
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

            <div className="d-flex align-items-center gap-2">
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Buscar usuario..."
                  style={{
                    padding: "0 12px 0 35px",
                    paddingLeft: 35,
                    borderRadius: 10,
                    width: 240,
                    height: 40,
                    marginBottom: 0,
                    boxSizing: "border-box",
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
                                : "#fdecea",
                            color:
                              user.status === "Activo"
                                ? "#2e7d32"
                                : user.status === "Inactivo"
                                ? "#ed6c02"
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

      {/* Bootstrap icons CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />
    </div>
  );
};

export default ListaUsuarios;
