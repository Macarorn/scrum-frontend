import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/detalles-proyecto.css";
import API_URL from "../../services/api";
import {
  getAccessToken,
  getUserIdFromToken,
  getUserRoleFromToken,
  refreshAccessToken,
  isCoordinador,
} from "../../services/auth.service";
import { obtenerMiRolEnProyecto } from "../../services/proyectos.service";
import {
  BiGroup,
  BiSearch,
  BiPlus,
  BiDotsVerticalRounded,
  BiEditAlt,
  BiLock,
  BiLockOpen,
  BiTransferAlt,
  BiSolidInbox,
  BiInfoCircle,
} from "react-icons/bi";
import { RoleDisplay } from "../../components/RoleInfoPopover";

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
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionMenu, setActionMenu] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [searchAdd, setSearchAdd] = useState("");
  const [searchAddQuery, setSearchAddQuery] = useState("");
  const [searchAddSubmitted, setSearchAddSubmitted] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [canCreateProjectRoles, setCanCreateProjectRoles] = useState(false);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const [roleEditError, setRoleEditError] = useState(null);
  const [showNewRoleInput, setShowNewRoleInput] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleError, setNewRoleError] = useState(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [menuPosition, setMenuPosition] = useState({}); // Para guardar posiciones de menús por usuario
  const [menuCoords, setMenuCoords] = useState({}); // Para guardar coordenadas de menús

  // Estados para transferencia de Product Owner
  const [showTransferPOModal, setShowTransferPOModal] = useState(false);
  const [transferPOTarget, setTransferPOTarget] = useState(null);
  const [transferPOLoading, setTransferPOLoading] = useState(false);
  const [transferPOError, setTransferPOError] = useState(null);

  const normalizeRole = (role) => String(role || "").trim().toLowerCase();
  const getRoleNameFromId = (roleId) =>
    roles.find((r) => String(r.id_rol) === String(roleId))?.nombre_rol || "";

  const createNewRole = async () => {
    const trimmedName = String(newRoleName || "").trim();
    const trimmedDescription = String(newRoleDescription || "").trim();
    
    if (!trimmedName) {
      setNewRoleError("Ingresa el nombre del nuevo rol");
      return;
    }

    if (!trimmedDescription) {
      setNewRoleError("La descripción del rol es obligatoria");
      return;
    }

    if (!(await canCreateRole())) {
      setNewRoleError("No tienes permisos para crear roles");
      return;
    }

    if (roles.some((r) => r.nombre_rol?.trim().toLowerCase() === trimmedName.toLowerCase())) {
      setNewRoleError("Ya existe un rol con ese nombre");
      return;
    }

    setCreatingRole(true);
    setNewRoleError(null);

    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/proyectos/${projectId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nombre_rol: trimmedName, descripcion: trimmedDescription }),
      });

      if (!res.ok) {
        let errMsg = `Error ${res.status}`;
        try {
          const body = await res.json();
          errMsg = body?.message || body?.error || errMsg;
        } catch (parseError) {
          void parseError;
        }
        setNewRoleError(errMsg);
        return;
      }

      const body = await res.json();
      const newRole = body?.data;
      if (newRole) {
        setRoles((prev) => [...prev, newRole]);
        setSelectedRole(String(newRole.id_rol));
        setNewRoleName("");
        setNewRoleDescription("");
        setShowNewRoleInput(false);
        setSuccessMessage(`Rol "${newRole.nombre_rol}" creado correctamente`);
      }
    } catch (err) {
      setNewRoleError(err.message || "No se pudo crear el rol");
    } finally {
      setCreatingRole(false);
    }
  };

    // Evitar la creación si el usuario no tiene permiso
const canCreateRole = async () => {
    const role = getUserRoleFromToken();
    if (role === "admin") return true;

    if (!projectId) return false;
    try {
      const projectRole = await obtenerMiRolEnProyecto(projectId);
      const roleName = String(projectRole?.rol || "").trim().toLowerCase();
      return roleName === "product owner" || roleName === "scrum master";
    } catch {
      return false;
    }
  };

  const determineProjectRolePermissions = async () => {
    const allowed = await canCreateRole();
    setCanCreateProjectRoles(allowed);
    };

  const activeSpecialRoles = users
    .filter(
      (u) =>
        u.status === "Activo" &&
        ["product owner", "scrum master"].includes(normalizeRole(u.role))
    )
    .map((u) => normalizeRole(u.role));

  const availableRoles = roles.filter((r) => {
    const roleName = normalizeRole(r.nombre_rol);
    if (roleName === "product owner" && activeSpecialRoles.includes("product owner")) {
      return false;
    }
    if (roleName === "scrum master" && activeSpecialRoles.includes("scrum master")) {
      return false;
    }
    return true;
  });

  const fallbackRoles = [
    { id_rol: 3, nombre_rol: "Product Owner" },
    { id_rol: 4, nombre_rol: "Scrum Master" },
    { id_rol: 5, nombre_rol: "Developer" },
    { id_rol: 2, nombre_rol: "QA" },
  ];

  const availableFallbackRoles = fallbackRoles.filter((r) => {
    const roleName = normalizeRole(r.nombre_rol);
    if (roleName === "product owner" && activeSpecialRoles.includes("product owner")) {
      return false;
    }
    if (roleName === "scrum master" && activeSpecialRoles.includes("scrum master")) {
      return false;
    }
    return true;
  });

  const roleOptions = roles.length > 0 ? availableRoles : availableFallbackRoles;

  const defaultSelectedRole =
    roleOptions.length > 0 ? String(roleOptions[0].id_rol) : selectedRole || "";

  const isEditingSameRole =
    editingMember &&
    normalizeRole(getRoleNameFromId(editingRole)) === normalizeRole(editingMember.role);

  const addPanelRef = useRef(null);
  const addButtonRef = useRef(null);
  const menuRefs = useRef({}); // Para guardar referencias a botones de menú
  const menuContainerRefs = useRef({}); // Para guardar referencias a contenedores de menú

  const navigate = useNavigate();

  // Determinar id de proyecto desde parámetros de ruta o querystring
  const { id: routeProjectId } = useParams();
  const projectId =
    routeProjectId ||
    new URLSearchParams(window.location.search).get("id_proyecto") ||
    new URLSearchParams(window.location.search).get("id") ||
    "1";

  // Cargar datos desde el backend al montar: miembros del proyecto, todos los usuarios (para añadir) y roles
  useEffect(() => {
    const cargarDatos = async () => {
      await refreshAccessToken();
      try {
        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1) Pedir la lista real de miembros del proyecto desde la API
        let miembros = [];
        try {
          const resMiembros = await fetch(`${API_URL}/proyectos/${projectId}/miembros`, { headers });
          if (resMiembros.ok) {
            const bodyMiembros = await resMiembros.json();
            miembros = bodyMiembros?.data || bodyMiembros || [];
          } else {
            console.warn("No se pudo cargar miembros del proyecto:", resMiembros.status);
          }
        } catch (err) {
          console.warn("Error consultando miembros del proyecto:", err.message);
        }

        // 2) Si no obtuvimos miembros, dejamos la lista vacía en vez de usar datos quemados
        if (!Array.isArray(miembros) || miembros.length === 0) {
          miembros = [];
        }

        // Mapear miembros a la forma de la UI
        const mappedMembers = (miembros || []).map((u) => ({
          id: u.id_usuario || u.id || (u.usuario && u.usuario.id_usuario),
          name: u.nombre || u.nombre_completo || (u.usuario && u.usuario.nombre) || u.name,
          email: u.email || (u.usuario && u.usuario.email) || "",
          role: u.rol || u.rol_principal || (u.roles && u.roles[0]?.nombre_rol) || u.nombre_rol || "Developer",
          roleDescription: u.roleDescription || u.descripcion || u.descripcion_rol || "",
          status: u.activo || (u.usuario && u.usuario.activo) ? "Activo" : "Inactivo",
          joinDate: (u.fecha_ingreso || u.fecha_registro) ? new Date(u.fecha_ingreso || u.fecha_registro).toLocaleDateString("es-ES") : "",
        }));

        setUsers(mappedMembers);

        // 3) Intentar cargar la lista completa de usuarios para el panel "Añadir miembro" usando el endpoint abierto de búsqueda.
        try {
          const resAll = await fetch(`${API_URL}/usuarios/buscar`, { headers });
          if (resAll.ok) {
            const bodyAll = await resAll.json();
            const rowsAll = bodyAll?.data || bodyAll || [];
            const mappedAll = (rowsAll || []).map((u) => ({
              id: u.id_usuario || u.id,
              name: u.nombre || u.nombre_completo || u.name,
              email: u.email,
              role: u.rol || u.rol_principal || (u.roles && u.roles[0]?.nombre_rol) || "Developer",
              status: u.activo ? "Activo" : "Inactivo",
              joinDate: (u.fecha_ingreso || u.fecha_registro) ? new Date(u.fecha_ingreso || u.fecha_registro).toLocaleDateString("es-ES") : "",
            }));
            setAllUsers(mappedAll);
          } else {
            // Si no podemos cargar usuarios para añadir, dejamos la lista vacía
            setAllUsers([]);
          }
        } catch {
          setAllUsers([]);
        }
      } catch (err) {
        // Si la carga falla, no mostrarnos datos quemados
        setUsers([]);
        setAllUsers([]);
        console.warn("No se pudieron cargar usuarios desde la API:", err.message);
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

  // Cerrar menú de acciones al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!actionMenu) return;

      // Verificar si el click está en el botón o en el menú
      const button = menuRefs.current[actionMenu];
      const menu = menuContainerRefs.current[actionMenu];

      if (button && button.contains(e.target)) return;
      if (menu && menu.contains(e.target)) return;

      setActionMenu(null);
      setMenuPosition({});
      setMenuCoords({});
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenu]);

  // Ocultar toast de éxito automáticamente
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const cargarRoles = async () => {
    try {
      const token = getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_URL}/proyectos/${projectId}/roles`, { headers });
      if (!res.ok) throw new Error(`Error cargando roles: ${res.status}`);
      const body = await res.json();
      const rows = body?.data || body || [];
      setRoles(rows);
    } catch (err) {
      console.warn("No se pudieron cargar roles desde la API:", err.message);
    }
  };

  // Cargar roles (para el select) en segundo plano
  useEffect(() => {
    if (projectId) {
      cargarRoles();
      determineProjectRolePermissions();
    }
  }, [projectId]);

  useEffect(() => {
    if (!selectedRole && defaultSelectedRole) {
      setSelectedRole(defaultSelectedRole);
    }
    if (
      selectedRole &&
      roles.length > 0 &&
      !availableRoles.some((r) => String(r.id_rol) === String(selectedRole))
    ) {
      setSelectedRole(defaultSelectedRole);
    }
  }, [roles, selectedRole, availableRoles, defaultSelectedRole]);

  // Recargar lista completa de usuarios cada vez que se abre el panel "Añadir Miembro"
  useEffect(() => {
    if (!showAddPanel) return;
    if (!searchAddQuery.trim()) {
      setAllUsers([]);
      return;
    }

    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const token = getAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const query = `?search=${encodeURIComponent(searchAddQuery.trim())}`;

        const resAll = await fetch(`${API_URL}/usuarios/buscar${query}`, {
          headers,
          signal: controller.signal,
        });
        if (resAll.ok) {
          const bodyAll = await resAll.json();
          const rowsAll = bodyAll?.data || bodyAll || [];
          const mappedAll = (rowsAll || []).map((u) => ({
            id: u.id_usuario || u.id,
            name: u.nombre || u.nombre_completo || u.name,
            email: u.email,
            role: u.rol || u.rol_principal || (u.roles && u.roles[0]?.nombre_rol) || "Developer",
            status: u.activo ? "Activo" : "Inactivo",
            joinDate: (u.fecha_ingreso || u.fecha_registro) ? new Date(u.fecha_ingreso || u.fecha_registro).toLocaleDateString("es-ES") : "",
          }));
          setAllUsers(mappedAll);
        }
      } catch {
        // no bloquear la UI si falla
      }
    };

    fetchUsers();

    return () => {
      controller.abort();
    };
  }, [showAddPanel, searchAddQuery]);

  // Usuarios disponibles para añadir (todos los usuarios menos los ya miembros)
  const availableUsers = allUsers.filter((u) => !users.some((m) => m.id === u.id));
  const filteredAvailable = availableUsers.filter((u) =>
    u.name.toLowerCase().includes(searchAddQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchAddQuery.toLowerCase())
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
    if (actionMenu === id) {
      setActionMenu(null);
      setMenuPosition({});
      setMenuCoords({});
      return;
    }

    // Calcular posición ANTES de mostrar el menú
    calculateMenuPosition(id);

    // Mostrar el menú después de calcular
    setActionMenu(id);
  };

  const calculateMenuPosition = (userId) => {
    const button = menuRefs.current[userId];
    if (!button) {
      // Si no existe el ref aún, forzar que se calcule en el siguiente ciclo
      requestAnimationFrame(() => {
        const btn = menuRefs.current[userId];
        if (btn) {
          computeMenuPosition(btn, userId);
        }
      });
      return;
    }

    computeMenuPosition(button, userId);
  };

  const computeMenuPosition = (button, userId) => {
    const rect = button.getBoundingClientRect();
    const menuHeight = 100;
    const menuWidth = 160;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Determinar si mostrar arriba o abajo
    const showAbove = spaceBelow < 150 && spaceAbove > menuHeight;

    // Calcular coordenadas (fixed positioning)
    let top = rect.bottom + 8; // Por defecto, abajo
    if (showAbove) {
      top = rect.top - menuHeight - 8; // Arriba
    }

    const left = rect.right - menuWidth; // Alinear a la derecha del botón

    setMenuPosition((prev) => ({
      ...prev,
      [userId]: showAbove ? "above" : "below",
    }));

    setMenuCoords((prev) => ({
      ...prev,
      [userId]: { top, left },
    }));
  };
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const sessionUserId = getUserIdFromToken();
  const sessionUserRole = getUserRoleFromToken();
  const currentUserProjectRole = users.find((m) => String(m.id) === String(sessionUserId))?.role || "";
  const currentUserStatus = users.find((m) => String(m.id) === String(sessionUserId))?.status || "";
  const allowedRoles = ["product owner", "scrum master"];
  const isGlobalAdmin = normalizeRole(sessionUserRole) === "admin";
  const isProjectLeader =
    currentUserStatus === "Activo" &&
    allowedRoles.includes(normalizeRole(currentUserProjectRole));
  const canManageMembers = isGlobalAdmin || isProjectLeader;
  const canEditRoles = canManageMembers;
  const showAddButton = canManageMembers;

  const handleSearchAdd = () => {
    setSearchAddQuery(searchAdd.trim());
    setSearchAddSubmitted(true);
  };

  const handleToggleMemberStatus = async (user) => {
    try {
      const token = getAccessToken();
      const res = await fetch(
        `${API_URL}/proyectos/${projectId}/miembros/${user.id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ activo: user.status !== "Activo" }),
        },
      );

      if (!res.ok) {
        let errMsg = `Error ${res.status}`;
        try {
          const body = await res.json();
          errMsg = body?.message || body?.error || errMsg;
        } catch {
          void 0;
        }
        throw new Error(errMsg);
      }

      const body = await res.json();
      const updated = body?.data;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
              ...u,
              status: updated?.activo ? "Activo" : "Inactivo",
            }
            : u,
        ),
      );
      setSuccessMessage(
        `Miembro ${user.status === "Activo" ? "inhabilitado" : "habilitado"} correctamente`,
      );
      setActionMenu(null);
    } catch (err) {
      setDuplicateAlert({ message: err.message || "Error actualizando estado del miembro" });
    }
  };

  const openRoleEditModal = (user) => {
    setEditingMember(user);
    const matchingRole = roles.find((r) => r.nombre_rol === user.role);
    setEditingRole(String(matchingRole?.id_rol || roles[0]?.id_rol || ""));
    setRoleEditError(null);
    setActionMenu(null);
  };

  const closeRoleEditModal = () => {
    setEditingMember(null);
    setEditingRole("");
    setRoleEditError(null);
  };

  const confirmEditRole = async () => {
    if (!editingMember || !editingRole) return;

    const selectedRoleName = getRoleNameFromId(editingRole);
    if (!selectedRoleName) {
      setRoleEditError("Rol seleccionado no es válido");
      return;
    }

    if (normalizeRole(selectedRoleName) === normalizeRole(editingMember.role)) {
      setRoleEditError("Ya tiene ese rol");
      return;
    }

    try {
      const token = getAccessToken();
      const res = await fetch(
        `${API_URL}/proyectos/${projectId}/miembros/${editingMember.id}/rol`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ id_rol: Number(editingRole) }),
        },
      );

      if (!res.ok) {
        let errMsg = `Error ${res.status}`;
        try {
          const body = await res.json();
          errMsg = body?.message || body?.error || errMsg;
        } catch (parseError) {
          void parseError;
        }
        setRoleEditError(errMsg);
        return;
      }

      const responseBody = await res.json();
      const updatedMemberData = responseBody?.data;
      const updatedRoleName = updatedMemberData?.rol || roles.find((r) => String(r.id_rol) === String(editingRole))?.nombre_rol;
      
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingMember.id ? { ...u, role: updatedRoleName || u.role } : u,
        ),
      );

      // Refrescar token después de cambiar rol para que los permisos se actualicen
      await refreshAccessToken();

      setSuccessMessage(`Rol actualizado para ${editingMember.name}`);
      closeRoleEditModal();
    } catch (err) {
      setRoleEditError(err.message || "Error al actualizar rol");
    }
  };

  const openTransferPOModal = (user) => {
    setTransferPOTarget(user);
    setTransferPOError(null);
    setShowTransferPOModal(true);
    setActionMenu(null);
  };

  const closeTransferPOModal = () => {
    setShowTransferPOModal(false);
    setTransferPOTarget(null);
    setTransferPOError(null);
    setTransferPOLoading(false);
  };

  const confirmTransferProductOwner = async () => {
    if (!transferPOTarget) return;

    setTransferPOLoading(true);
    setTransferPOError(null);

    try {
      const token = getAccessToken();
      const res = await fetch(
        `${API_URL}/proyectos/${projectId}/transferir-product-owner`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ id_usuario_nuevo_po: transferPOTarget.id }),
        },
      );

      if (!res.ok) {
        let errMsg = `Error ${res.status}`;
        try {
          const body = await res.json();
          errMsg = body?.message || body?.error || errMsg;
        } catch (parseError) {
          void parseError;
        }
        setTransferPOError(errMsg);
        setTransferPOLoading(false);
        return;
      }

      const body = await res.json();
      const { nuevoProductOwner, antiguoProductOwner } = body.data || {};

      // Actualizar la lista de usuarios
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === nuevoProductOwner?.id_usuario) {
            return { ...u, role: "Product Owner", status: "Activo" };
          }
          if (u.id === antiguoProductOwner?.id_usuario) {
            return { ...u, status: "Inactivo" };
          }
          return u;
        }),
      );

      // Refrescar token
      await refreshAccessToken();

      setSuccessMessage(
        `Product Owner transferido a ${transferPOTarget.name}. ${currentUserProjectRole === "Product Owner" ? "Ahora estás inactivo." : ""
        }`
      );
      closeTransferPOModal();
    } catch (err) {
      setTransferPOError(err.message || "Error al transferir Product Owner");
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

    setSelectedRole(defaultSelectedRole);
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
      const res = await fetch(`${API_URL}/solicitudes/enviar-invitacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id_usuario: selectedUser.id,
          id_proyecto: projectId,
          id_rol: selectedRole,
        }),
      });

      if (!res.ok) {
        // intentar leer mensaje de error
        let errMsg = `Error ${res.status}`;
        try {
          const body = await res.json();
          errMsg = body?.message || body?.error || errMsg;
        } catch (parseError) {
          void parseError;
        }
        throw new Error(errMsg);
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(`Solicitud enviada a ${selectedUser.name}`);
      setShowModal(false);
      setShowAddPanel(false);
    } catch (err) {
      console.error(err);
      // Cerrar modal de asignar rol y mostrar mensaje de error estilizado
      setShowModal(false);
      setDuplicateAlert({ message: err.message || "Error al enviar solicitud" });
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
          {isCoordinador() && (
            <button
              type="button"
              className="btn-soft"
              onClick={() => navigate("/proyectos")}
              style={{ marginLeft: 16 }}
            >
              Volver
            </button>
          )}
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
                  <BiGroup style={{ color: "#2e7d32", fontSize: 22 }} />
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

            <div className="lista-usuarios-header">
              <div className="lista-usuarios-search" style={{ flex: 1, minWidth: 0, width: "auto" }}>
                <input
                  type="text"
                  className="form-control lista-usuarios-search-input"
                  placeholder="Buscar usuario..."
                  value={search}
                  onChange={handleSearch}
                  style={{ paddingLeft: 64, width: "100%" }}
                />
                <BiSearch className="lista-usuarios-search-icon" />
              </div>

              {showAddButton && (
                <button
                  className="btn btn-add-member"
                  ref={addButtonRef}
                  onClick={() => setShowAddPanel((s) => !s)}
                >
                  <BiPlus className="me-2" /> Añadir Miembro
                </button>
              )}

              {/* 🔥 PANEL CORRECTO */}
              {showAddPanel && (
                <div
                  ref={addPanelRef}
                  className="bg-white border rounded shadow-sm p-3"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    width: 320,
                    zIndex: 999,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* INPUT */}
                  <div className="mb-3" style={{ width: "100%" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por nombre o correo..."
                      value={searchAdd}
                      onChange={(e) => setSearchAdd(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearchAdd();
                        }
                      }}
                      style={{
                        borderRadius: 10,
                        height: 40,
                        width: "100%",
                      }}
                    />
                  </div>
                  <div className="d-flex justify-content-end mb-3">
                    <button
                      type="button"
                      className="btn btn-success"
                      style={{
                        width: 95,
                        borderRadius: 10,
                        fontWeight: 500,
                        height: 38,
                      }}
                      onClick={handleSearchAdd}
                    >
                      Buscar
                    </button>
                  </div>

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

                    {filteredAvailable.length === 0 && searchAddSubmitted && searchAddQuery !== "" && (
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
                    <th scope="col" style={{ width: "28%" }}>
                      Nombre
                    </th>
                    <th scope="col" style={{ width: "27%" }}>
                      Correo
                    </th>
                    <th scope="col" style={{ width: "15%" }}>
                      Rol
                    </th>
                    <th scope="col" style={{ width: "12%" }}>
                      Estado
                    </th>
                    <th scope="col" style={{ width: "13%" }}>
                      Fecha de ingreso
                    </th>
                    <th scope="col" style={{ width: "5%", textAlign: "center" }}></th>
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
                      <td>
                        <RoleDisplay
                          roleName={user.role}
                          roleDescription={user.roleDescription}
                          variant="badge"
                          showIcon={true}
                          popoverPosition="bottom"
                        />
                      </td>
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
                        {canManageMembers && (
                          <button
                            ref={(el) => {
                              if (el) menuRefs.current[user.id] = el;
                            }}
                            className="btn btn-link text-dark p-0"
                            style={{ fontSize: 20 }}
                            onClick={() => handleActionMenu(user.id)}
                            title="Opciones"
                          >
                            <BiDotsVerticalRounded />
                          </button>
                        )}
                        {actionMenu === user.id && (
                          <div
                            ref={(el) => {
                              if (el) menuContainerRefs.current[user.id] = el;
                            }}
                            className="shadow-sm rounded bg-white border"
                            style={{
                              position: "fixed",
                              top: `${menuCoords[user.id]?.top || 0}px`,
                              left: `${menuCoords[user.id]?.left || 0}px`,
                              minWidth: 160,
                              zIndex: 1050,
                            }}
                          >
                            {canEditRoles && (
                              <>
                                <button
                                  className="dropdown-item"
                                  onClick={() => openRoleEditModal(user)}
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
                                  <BiEditAlt className="me-2" /> Editar rol
                                </button>
                                {!(
                                  (user.status === "Activo" && ["Product Owner", "Scrum Master"].includes(user.role)) ||
                                  (user.status === "Inactivo" && ["Product Owner", "Scrum Master"].includes(user.role) &&
                                    users.some(
                                      (u) =>
                                        u.status === "Activo" &&
                                        u.role === user.role &&
                                        u.id !== user.id,
                                    ))
                                ) && (
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleToggleMemberStatus(user)}
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
                                      {user.status === "Activo" ? (
                                        <BiLock className="me-2" />
                                      ) : (
                                        <BiLockOpen className="me-2" />
                                      )}
                                      {user.status === "Activo"
                                        ? "Inhabilitar miembro"
                                        : "Habilitar miembro"}
                                    </button>
                                  )}
                                {normalizeRole(currentUserProjectRole) === "product owner" &&
                                  String(user.id) !== String(sessionUserId) &&
                                  user.status === "Activo" && (
                                    <>
                                      <hr style={{ margin: "4px 0" }} />
                                      <button
                                        className="dropdown-item"
                                        onClick={() => openTransferPOModal(user)}
                                        style={{
                                          display: "block",
                                          width: "100%",
                                          textAlign: "left",
                                          padding: "8px 16px",
                                          border: "none",
                                          backgroundColor: "transparent",
                                          cursor: "pointer",
                                          fontSize: 14,
                                          color: "#d32f2f",
                                        }}
                                        onMouseEnter={(e) =>
                                          (e.currentTarget.style.backgroundColor = "#ffebee")
                                        }
                                        onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                          "transparent")
                                        }
                                      >
                                        <BiTransferAlt className="me-2" /> Transferir PO
                                      </button>
                                    </>
                                  )}
                              </>
                            )}
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
              <BiSolidInbox style={{ fontSize: 48, color: "#ccc" }} />
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
              className="form-select mb-2"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {roleOptions.length > 0 ? (
                roleOptions.map((r) => (
                  <option key={r.id_rol} value={String(r.id_rol)}>
                    {r.nombre_rol}
                  </option>
                ))
              ) : (
                <option value="">No hay roles disponibles</option>
              )}
            </select>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm mb-3"
              style={{ minWidth: 150, fontWeight: 500 }}
              onClick={() => {
                setShowNewRoleInput((prev) => !prev);
                setNewRoleError(null);
                setNewRoleName("");
                setNewRoleDescription("");
              }}
              disabled={!canCreateProjectRoles}
            >
              {showNewRoleInput ? "Cancelar creación de rol" : "Crear nuevo rol"}
            </button>

            {!canCreateProjectRoles && (
              <div className="text-muted small mb-2">
                Solo Product Owner o Scrum Master pueden crear nuevos roles de proyecto.
              </div>
            )}

            {showNewRoleInput && (
              <div className="mb-3">
                <label className="form-label">Nuevo rol</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Nombre del rol"
                />
                <label className="form-label">Descripción <span style={{color: "red"}}>*</span></label>
                <textarea
                  className="form-control"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Describe las responsabilidades y funciones de este rol"
                  rows={3}
                />
                {newRoleError && (
                  <div className="text-danger mt-2">{newRoleError}</div>
                )}
                <button
                  type="button"
                  className="btn btn-primary mt-3"
                  onClick={createNewRole}
                  disabled={creatingRole}
                >
                  {creatingRole ? "Guardando..." : "Guardar rol"}
                </button>
              </div>
            )}

            {/* Botones */}
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn-cerrar-modal"
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
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      )}

      {editingMember && (
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
            <h5 style={{ marginBottom: 15 }}>Editar rol</h5>

            <div style={{ marginBottom: 15 }}>
              <strong>{editingMember.name}</strong>
              <div style={{ fontSize: 12, color: "#6c757d" }}>
                {editingMember.email}
              </div>
            </div>

            <select
              className="form-select mb-3"
              value={editingRole}
              onChange={(e) => setEditingRole(e.target.value)}
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

            {isEditingSameRole && !roleEditError && (
              <div className="alert alert-warning p-2 mb-3" role="alert">
                Seleccionaste el mismo rol actual. Elige otro rol para cambiarlo.
              </div>
            )}

            {roleEditError && (
              <div className="alert alert-danger p-2 mb-3" role="alert">
                {roleEditError}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button className="btn-cerrar-modal" onClick={closeRoleEditModal}>
                Cancelar
              </button>
              <button
                className="btn"
                style={{
                  backgroundColor: isEditingSameRole ? "#6c757d" : "#2e7d32",
                  color: "white",
                }}
                onClick={confirmEditRole}
                disabled={isEditingSameRole}
              >
                Guardar rol
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

      {/* MODAL PARA TRANSFERIR PRODUCT OWNER */}
      {showTransferPOModal && transferPOTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 24,
              width: 450,
              maxWidth: "92%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <h5 style={{ marginBottom: 8, color: "#d32f2f" }}>
                <BiInfoCircle className="me-2" />
                Transferir Product Owner
              </h5>
              <p style={{ color: "#6c757d", marginBottom: 0, fontSize: 14 }}>
                Esta es una acción importante. Confirma que deseas transferir el rol de Product Owner.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#fff3e0",
                border: "1px solid #ffe0b2",
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
              }}
            >
              <p style={{ marginBottom: 8, fontSize: 13 }}>
                <strong>Nuevo Product Owner:</strong>
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: getAvatarColor(transferPOTarget.name),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(transferPOTarget.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{transferPOTarget.name}</div>
                  <div style={{ fontSize: 12, color: "#6c757d" }}>
                    {transferPOTarget.email}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#f3e5f5",
                border: "1px solid #e1bee7",
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <p style={{ marginBottom: 8 }}>
                <strong>Al transferir:</strong>
              </p>
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>
                  <strong>{transferPOTarget.name}</strong> se convertirá en Product Owner{" "}
                  <strong>activo</strong>
                </li>
                <li>
                  Tu rol como Product Owner se mantendrá pero pasarás a estado{" "}
                  <strong>inactivo</strong>
                </li>
                <li>Solo puede haber un Product Owner activo por proyecto</li>
              </ul>
            </div>

            {transferPOError && (
              <div className="alert alert-danger p-2 mb-3" role="alert">
                <strong>Error:</strong> {transferPOError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                className="btn-cerrar-modal"
                onClick={closeTransferPOModal}
                disabled={transferPOLoading}
              >
                Cancelar
              </button>
              <button
                className="btn"
                style={{
                  backgroundColor: "#d32f2f",
                  color: "white",
                }}
                onClick={confirmTransferProductOwner}
                disabled={transferPOLoading}
              >
                {transferPOLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Transferindo...
                  </>
                ) : (
                  <>
                    <BiTransferAlt className="me-2" />
                    Confirmar transferencia
                  </>
                )}
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
