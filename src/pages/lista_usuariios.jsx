import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import "../assets/detalles_de_proyecto.css";

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
  const [users, setUsers] = useState(ALL_USERS.slice(0, 5));
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchAdd, setSearchAdd] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Developer");
  const [showModal, setShowModal] = useState(false);

  const availableUsers = ALL_USERS.filter(
    (u) => !users.some((added) => added.id === u.id)
  );
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
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setActionMenu(null);
    setPage(1);
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setSelectedRole("Developer");
    setShowModal(true);
  };

  const confirmAddUser = () => {
    const newUser = {
      ...selectedUser,
      role: selectedRole,
      status: "En espera",
    };

    setUsers((prev) => [...prev, newUser]);
    setShowModal(false);
    setShowAddPanel(false);
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
                onClick={() => setShowAddPanel(!showAddPanel)}
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
              <option>Product Owner</option>
              <option>Scrum Master</option>
              <option>Developer</option>
              <option>QA</option>
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

      {/* Bootstrap icons CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />
    </div>
  );
};

export default ListaUsuarios;
