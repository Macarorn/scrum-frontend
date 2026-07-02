import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchBox from "../../components/SearchBox/SearchBox";
import {
  clearSessionTokens,
  getAccessToken,
  canEditBacklog,
  isCoordinador,
} from "../../services/auth.service";
import {
  actualizarHistoria,
  crearHistoria,
  listarCriteriosHistoria,
  listarHistoriasPorEpica,
} from "../../services/historias.service";
import { contarTareasPorHistoria } from "../../services/tareas.service";
import {
  getActiveProjectId,
  setActiveProjectId,
} from "../../services/project-context.service";
import { listarProyectos, listarTodosProyectos } from "../../services/proyectos.service";
import "../../styles/Backlog.css";

const PRIORIDADES = [1, 2, 3, 4, 5];

const normalizeId = (item, keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }

  return "";
};

const getStoredEpicaId = (proyectoId) => {
  if (!proyectoId) return "";

  try {
    return localStorage.getItem(`scrum.active_epica.${proyectoId}`) || "";
  } catch {
    return "";
  }
};

const setStoredEpicaId = (proyectoId, epicaId) => {
  if (!proyectoId) return;

  try {
    const key = `scrum.active_epica.${proyectoId}`;
    if (epicaId) {
      localStorage.setItem(key, String(epicaId));
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage failures
  }
};

const normalizeHistoria = (item) => ({
  ...item,
  id: normalizeId(item, ["id", "id_historia"]),
  epicaId: normalizeId(item, ["epicaId", "id_epica"]),
  storyPoints: normalizeId(item, ["storyPoints", "story_points"]) || 3,
  prioridad: normalizeId(item, ["prioridad"]) || 3,
});

const normalizeEpica = (item) => ({
  ...item,
  id: normalizeId(item, ["id", "id_epica"]),
  proyectoId: normalizeId(item, ["proyectoId", "id_proyecto"]),
});

export default function Backlog() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialProyectoId =
    searchParams.get("id_proyecto") || getActiveProjectId() || "";

  const [proyectos, setProyectos] = useState([]);
  const [epicas, setEpicas] = useState([]);
  const [historias, setHistorias] = useState([]);
  const [criteriaCounts, setCriteriaCounts] = useState({});
  const [epicaCounts, setEpicaCounts] = useState({});
  const [taskCounts, setTaskCounts] = useState({});

  const [selectedProyecto, setSelectedProyecto] = useState(initialProyectoId);
  const [selectedEpica, setSelectedEpica] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);
  const [loadingEpicas, setLoadingEpicas] = useState(false);
  const [loadingHistorias, setLoadingHistorias] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processingConfirm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    body: "",
    confirmLabel: "Aceptar",
    cancelLabel: "Cancelar",
    onConfirm: null,
  });
  const [epicaMenuOpen, setEpicaMenuOpen] = useState(false);
  const [editingHistoriaId, setEditingHistoriaId] = useState(null);
  const [isEditingHistoria, setIsEditingHistoria] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    prioridad: 3,
    storyPoints: 3,
  });
  const [canEdit, setCanEdit] = useState(false);
  // Modal para crear épica si no hay épicas
  const [showEpicaModal, setShowEpicaModal] = useState(false);
  const [dontShowEpicaModal, setDontShowEpicaModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Checar si el modal ya fue ocultado para este proyecto
  useEffect(() => {
    if (!selectedProyecto) return;
    const key = `scrum.hideEpicaModal.${selectedProyecto}`;
    setDontShowEpicaModal(localStorage.getItem(key) === "1");
  }, [selectedProyecto]);

  // Cargar permisos de edición cuando cambie el proyecto seleccionado
  useEffect(() => {
    const loadPermissions = async () => {
      if (selectedProyecto) {
        const hasPermission = await canEditBacklog(selectedProyecto);
        setCanEdit(hasPermission);
      }
    };
    loadPermissions();
  }, [selectedProyecto]);

  useEffect(() => {
    if (!selectedProyecto || !selectedEpica) return;
    setStoredEpicaId(selectedProyecto, selectedEpica);
  }, [selectedProyecto, selectedEpica]);

  // Mostrar modal automáticamente si corresponde (solo para PO o Scrum Master)
  useEffect(() => {
    if (
      !loadingEpicas &&
      selectedProyecto &&
      epicas.length === 0 &&
      !dontShowEpicaModal &&
      canEdit
    ) {
      setShowEpicaModal(true);
    } else {
      setShowEpicaModal(false);
    }
  }, [loadingEpicas, selectedProyecto, epicas.length, dontShowEpicaModal, canEdit]);

  // reset close-confirm when modal opens
  useEffect(() => {
    if (showEpicaModal) setShowCloseConfirm(false);
  }, [showEpicaModal]);

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };
  // ...existing code...

  const syncQuery = (nextProyecto, nextEpica) => {
    const nextQuery = {};

    if (nextProyecto) nextQuery.id_proyecto = nextProyecto;
    if (nextEpica) nextQuery.id_epica = nextEpica;

    setSearchParams(nextQuery, { replace: true });
  };

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = isCoordinador() ? await listarTodosProyectos() : await listarProyectos();
        const items = response.data || [];
        setProyectos(items);

        if (items.length === 0) {
          setSelectedProyecto("");
          setActiveProjectId("");
          setSelectedEpica("");
          setEpicas([]);
          setHistorias([]);
          return;
        }

        const currentProject = items.some(
          (item) => String(item.id_proyecto) === String(selectedProyecto),
        )
          ? selectedProyecto
          : String(items[0].id_proyecto);

        setSelectedProyecto(currentProject);
        setActiveProjectId(currentProject);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        showError(err.message || "No se pudieron cargar los proyectos");
        setError("");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProyecto) {
      setActiveProjectId("");
      setEpicas([]);
      setSelectedEpica("");
      setHistorias([]);
      setCriteriaCounts({});
      setTaskCounts({});
      syncQuery("", "");
      return;
    }

    setActiveProjectId(selectedProyecto);
    setEpicas([]);
    setSelectedEpica("");
    setHistorias([]);
    setCriteriaCounts({});
    setTaskCounts({});

    const loadEpicas = async () => {
      setLoadingEpicas(true);
      setError("");
      setSuccess("");

      try {
        const token = getAccessToken();
        if (!token) {
          throw { code: "UNAUTHENTICATED" };
        }

        const response = await fetch(
          `http://localhost:3000/api/epicas?proyectoId=${selectedProyecto}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw { code: "UNAUTHENTICATED" };
          }

          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || "No se pudieron cargar las epicas");
        }

        const payload = await response.json();
        const items = (payload.data || []).map(normalizeEpica);
        setEpicas(items);

        if (items.length === 0) {
          setSelectedEpica("");
          setHistorias([]);
          syncQuery(selectedProyecto, "");
          return;
        }

        // Prioridad 1: Siempre buscar épica en progreso para este proyecto
        const epicaEnProgreso = items.find(
          (item) => String(item.estado).toLowerCase() === "en_progreso"
        );

        let nextEpica;
        if (epicaEnProgreso) {
          nextEpica = String(epicaEnProgreso.id);
        } else {
          // Prioridad 2: Usar la épica guardada en localStorage para este proyecto
          const storedEpica = getStoredEpicaId(selectedProyecto);
          const existsStored = storedEpica && items.some(
            (item) => String(item.id) === String(storedEpica)
          );

          if (existsStored) {
            nextEpica = storedEpica;
          } else if (items.length > 0) {
            // Prioridad 3: Usar la primera épica
            nextEpica = String(items[0].id);
          } else {
            nextEpica = "";
          }
        }

        setSelectedEpica(nextEpica);
        syncQuery(selectedProyecto, nextEpica);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        showError(err.message || "No se pudieron cargar las epicas");
        setError("");
      } finally {
        setLoadingEpicas(false);
      }
    };

    loadEpicas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProyecto]);

  useEffect(() => {
    if (!selectedProyecto || epicas.length === 0) {
      setEpicaCounts({});
      return;
    }

    const loadCounts = async () => {
      try {
        const token = getAccessToken();
        if (!token) throw { code: "UNAUTHENTICATED" };

        const response = await fetch(`http://localhost:3000/api/historias`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) throw { code: "UNAUTHENTICATED" };
          const body = await response.json().catch(() => ({}));
          throw new Error(body.message || "No se pudieron cargar las historias");
        }

        const payload = await response.json();
        const items = payload.data || [];

        const epicaIds = new Set(epicas.map((e) => String(e.id)));
        const countsMap = {};
        for (const h of items) {
          const eid = String(h.epicaId ?? h.id_epica ?? "");
          if (!epicaIds.has(eid)) continue;
          countsMap[eid] = (countsMap[eid] || 0) + 1;
        }

        const pairs = epicas.map((epica) => [epica.id, countsMap[String(epica.id)] || 0]);
        setEpicaCounts(Object.fromEntries(pairs));
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        // Fallback: 0 counts on error
        const pairs = epicas.map((epica) => [epica.id, 0]);
        setEpicaCounts(Object.fromEntries(pairs));
      }
    };

    loadCounts();
  }, [epicas, selectedProyecto]);

  useEffect(() => {
    if (!selectedEpica) {
      setHistorias([]);
      setCriteriaCounts({});
      setTaskCounts({});
      return;
    }

    setHistorias([]);
    setCriteriaCounts({});
    setTaskCounts({});

    const loadHistorias = async () => {
      setLoadingHistorias(true);
      setError("");
      setSuccess("");

      try {
        const items = (await listarHistoriasPorEpica(selectedEpica)) || [];
        const normalized = items.map(normalizeHistoria);
        setHistorias(normalized);

        const counts = await Promise.all(
          normalized.map(async (historia) => {
            try {
              const criterios = await listarCriteriosHistoria(historia.id);
              return [
                historia.id,
                Array.isArray(criterios) ? criterios.length : 0,
              ];
            } catch {
              return [historia.id, 0];
            }
          }),
        );

        setCriteriaCounts(Object.fromEntries(counts));

        const taskCountPromises = normalized.map(async (historia) => {
          try {
            const count = await contarTareasPorHistoria(historia.id);
            return [historia.id, count];
          } catch {
            return [historia.id, 0];
          }
        });

        setTaskCounts(Object.fromEntries(await Promise.all(taskCountPromises)));
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        showError(err.message || "No se pudieron cargar las historias");
        setError("");
      } finally {
        setLoadingHistorias(false);
      }
    };

    loadHistorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEpica]);

  // close project/epica pickers when clicking outside or pressing Escape
  useEffect(() => {
    if (!projectMenuOpen && !epicaMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest(".backlog-epica-picker"))
        return;
      setProjectMenuOpen(false);
      setEpicaMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setProjectMenuOpen(false);
        setEpicaMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [projectMenuOpen, epicaMenuOpen]);

  const selectedEpicaData = useMemo(
    () =>
      epicas.find((item) => String(item.id) === String(selectedEpica)) || null,
    [epicas, selectedEpica],
  );

  const epicaLabel = selectedEpicaData?.nombre || "Épica";

  const historiasFiltradas = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return historias;

    return historias.filter((historia) => {
      const nombre = (historia.nombre || "").toLowerCase();
      const descripcion = (historia.descripcion || "").toLowerCase();
      const id = String(historia.id || "");
      return (
        nombre.includes(query) ||
        descripcion.includes(query) ||
        id.includes(query)
      );
    });
  }, [historias, searchTerm]);

  const historiaDisplayIds = useMemo(() => {
    const ordered = [...historias].sort(
      (a, b) => Number(a.id || 0) - Number(b.id || 0),
    );
    return ordered.reduce((acc, item, index) => {
      acc[String(item.id)] = index + 1;
      return acc;
    }, {});
  }, [historias]);

  const openNewHistoria = () => {
    setEditingHistoriaId(null);
    setIsEditingHistoria(true);
    setForm({
      nombre: "",
      descripcion: "",
      prioridad: 3,
      storyPoints: 3,
    });
    setFormOpen(true);
  };


  const closeForm = () => {
    setFormOpen(false);
    setEditingHistoriaId(null);
    setIsEditingHistoria(false);
  };

  const startEditHistoria = () => {
    setIsEditingHistoria(true);
  };

  const cancelEditHistoria = () => {
    if (editingHistoriaId) {
      const historia = historias.find(
        (item) => String(item.id) === String(editingHistoriaId),
      );
      if (historia) {
        setForm({
          nombre: historia.nombre || "",
          descripcion: historia.descripcion || "",
          prioridad: historia.prioridad || 3,
          storyPoints: historia.storyPoints || 3,
        });
      }
      setIsEditingHistoria(false);
      return;
    }

    closeForm();
  };

  const reloadHistorias = async () => {
    if (!selectedEpica) return;

    const items = (await listarHistoriasPorEpica(selectedEpica)) || [];
    const normalized = items.map(normalizeHistoria);
    setHistorias(normalized);

    const counts = await Promise.all(
      normalized.map(async (historia) => {
        try {
          const criterios = await listarCriteriosHistoria(historia.id);
          return [historia.id, Array.isArray(criterios) ? criterios.length : 0];
        } catch {
          return [historia.id, 0];
        }
      }),
    );

    setCriteriaCounts(Object.fromEntries(counts));

    const taskCountPromises = normalized.map(async (historia) => {
      try {
        const count = await contarTareasPorHistoria(historia.id);
        return [historia.id, count];
      } catch {
        return [historia.id, 0];
      }
    });

    setTaskCounts(Object.fromEntries(await Promise.all(taskCountPromises)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedEpica) {
      showWarning("Por favor selecciona una épica antes de crear la historia.");
      return;
    }

    if (!form.nombre.trim()) {
      showWarning("Por favor ingresa el nombre de la historia de usuario.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        nombre: form.nombre.trim(),
        epicaId: Number(selectedEpica),
        descripcion: form.descripcion.trim(),
        prioridad: Number(form.prioridad),
        storyPoints: Number(form.storyPoints),
      };

      if (editingHistoriaId) {
        await actualizarHistoria(editingHistoriaId, payload);
      } else {
        await crearHistoria(payload);
      }

      await reloadHistorias();
      showSuccess(
        editingHistoriaId ? "Historia guardada correctamente" : "Historia creada exitosamente",
      );
      setSuccess("");
      closeForm();
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo guardar la historia");
      setError("");
    } finally {
      setSaving(false);
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, show: false, onConfirm: null }));
  };





  const handleOpenDetail = (historia) => {
    navigate(
      `/historias/${historia.id}?id_epica=${selectedEpica}&id_proyecto=${selectedProyecto}`,
    );
  };

  <Modal show={confirmModal.show} onHide={closeConfirmModal} centered>
    <Modal.Header>
      <Modal.Title>{confirmModal.title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{confirmModal.body}</Modal.Body>
    <Modal.Footer>
      <button
        type="button"
        className="btn-soft"
        onClick={closeConfirmModal}
        disabled={processingConfirm}
      >
        {confirmModal.cancelLabel}
      </button>
      <button
        type="button"
        className={
          confirmModal.confirmLabel === "Eliminar" ? "btn-danger" : "btn-main"
        }
        onClick={confirmModal.onConfirm}
        disabled={processingConfirm || !confirmModal.onConfirm}
      >
        {processingConfirm ? "Procesando..." : confirmModal.confirmLabel}
      </button>
    </Modal.Footer>
  </Modal>;

  const goToNewEpica = () => {
    if (!selectedProyecto) return;

    navigate(`/epicas/nueva?id_proyecto=${selectedProyecto}`);
  };

  const goToEpicasOverview = () => {
    if (!selectedProyecto) return;

    navigate(`/epicas?id_proyecto=${selectedProyecto}`);
  };

  return (
    <section className="backlog-page">
      <header className="backlog-topbar">
        <div className="backlog-topbar-left">
          <div className="backlog-title-row">
            <h1 className="backlog-title">Gestor de Backlog</h1>
            <div className="backlog-selector backlog-project-selector">
              <div className="backlog-epica-picker">
                {isCoordinador() ? (
                  <span className="backlog-epica-toggle-static">
                    {proyectos.find(
                      (p) => String(p.id_proyecto) === String(selectedProyecto),
                    )?.nombre || "Sin proyecto"}
                  </span>
                ) : (
                  <>
                <button
                  type="button"
                  className="backlog-epica-toggle"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const shouldRight = window.innerWidth - rect.right < 360;
                    setProjectMenuRight(shouldRight);
                    setProjectMenuOpen((prev) => !prev);
                  }}
                  disabled={loading || proyectos.length === 0}
                  aria-haspopup="menu"
                  aria-expanded={projectMenuOpen}
                >
                  <span>
                    {proyectos.find(
                      (p) => String(p.id_proyecto) === String(selectedProyecto),
                    )?.nombre || "Sin proyecto"}
                  </span>
                  <span className="backlog-epica-caret">▾</span>
                </button>

                {projectMenuOpen && (
                  <div
                    className={`backlog-epica-menu ${projectMenuRight ? "menu-right" : ""}`}
                    role="menu"
                  >
                    <div className="backlog-epica-menu-list">
                      {proyectos.map((proyecto) => (
                        <button
                          key={proyecto.id_proyecto}
                          type="button"
                          className={`backlog-epica-item ${String(proyecto.id_proyecto) === String(selectedProyecto) ? "selected" : ""}`}
                          onClick={() => {
                            const nextProject = String(proyecto.id_proyecto);
                            setSelectedProyecto(nextProject);
                            setActiveProjectId(nextProject);
                            setSelectedEpica("");
                            setEpicas([]);
                            setHistorias([]);
                            setCriteriaCounts({});
                            setTaskCounts({});
                            setEpicaMenuOpen(false);
                            syncQuery(nextProject, "");
                            setProjectMenuOpen(false);
                          }}
                        >
                          <span className="backlog-epica-item-name">
                            {proyecto.nombre}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                </>
                )}
              </div>
            </div>
          </div>
          <div className="backlog-epica-picker backlog-epica-picker-inline">
            <div className="backlog-epica-inline-wrap">
              <label className="backlog-epica-label">Épica:</label>
              <button
                type="button"
                className="backlog-epica-toggle backlog-epica-toggle-inline"
                onClick={() => setEpicaMenuOpen((prev) => !prev)}
                disabled={loadingEpicas || epicas.length === 0}
                aria-haspopup="menu"
                aria-expanded={epicaMenuOpen}
              >
                <span className="backlog-epica-button-label">{epicaLabel}</span>
                <span className="backlog-epica-caret">▾</span>
              </button>
            </div>

            {epicaMenuOpen && (
              <div className="backlog-epica-menu" role="menu">
                <div className="backlog-epica-menu-list">
                  {epicas.map((epica) => {
                    const isSelected =
                      String(epica.id) === String(selectedEpica);

                    return (
                      <button
                        key={epica.id}
                        type="button"
                        className={`backlog-epica-item ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedEpica(String(epica.id));
                          setEpicaMenuOpen(false);
                          syncQuery(selectedProyecto, String(epica.id));
                        }}
                      >
                        <span className="backlog-epica-item-name">
                          {epica.nombre}
                        </span>
                        <span className="backlog-epica-item-count">
                          H. Usuario {epicaCounts[epica.id] ?? 0}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="backlog-epica-all"
                  onClick={() => {
                    setEpicaMenuOpen(false);
                    navigate(`/epicas?id_proyecto=${selectedProyecto}`);
                  }}
                >
                  Ver todas las Epicas
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="backlog-actions">
          {canEdit && (
            <button
              type="button"
              className="btn-new-backlog"
              onClick={openNewHistoria}
              disabled={!selectedEpica}
            >
              + Nueva Historia
            </button>
          )}

          <SearchBox
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar"
            className="backlog-search"
          />
          {isCoordinador() && (
            <button
              type="button"
              className="btn-soft"
              onClick={() => navigate(`/detalles_de_proyecto/${selectedProyecto}`)}
            >
              Volver
            </button>
          )}
        </div>
      </header>





      {!error && !loading && proyectos.length === 0 && (
        <p className="backlog-feedback">No hay proyectos disponibles.</p>
      )}

      {/* Modal para crear épica si no hay épicas */}
      <Modal
        show={showEpicaModal}
        onHide={() => setShowEpicaModal(false)}
        centered
        backdrop="static"
        keyboard={true}
        className="epica-modal"
      >
        <Modal.Header>
          <Modal.Title>¡Crea la primera épica de tu proyecto!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ marginTop: 10 }}>
          <h5>¿Por qué necesitas una épica?</h5>
          <p>
            Necesitas al menos una épica para poder organizar historias en el
            backlog. El formulario se abrirá con el proyecto actual
            seleccionado.
          </p>
          <div
            className="backlog-empty-epicas-actions"
            style={{ marginTop: 30, marginBottom: 20 }}
          >
            <Button
              variant="success"
              onClick={() => {
                setShowEpicaModal(false);
                goToNewEpica();
              }}
            >
              + Nueva Épica
            </Button>
            <Button
              variant="outline-success"
              onClick={() => {
                setShowEpicaModal(false);
                goToEpicasOverview();
              }}
            >
              Ver épicas del proyecto
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {!showCloseConfirm ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                marginTop: 10,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outline-secondary"
                onClick={() => setShowCloseConfirm(true)}
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEpicaModal(false);
                  localStorage.setItem(
                    `scrum.hideEpicaModal.${selectedProyecto}`,
                    "1",
                  );
                  setDontShowEpicaModal(true);
                  setShowCloseConfirm(false);
                }}
              >
                No volver a mostrar para este proyecto
              </Button>

              <Button
                variant="outline-secondary"
                onClick={() => {
                  setShowEpicaModal(false);
                  setShowCloseConfirm(false);
                }}
              >
                Cerrar
              </Button>
            </div>
          )}
        </Modal.Footer>
      </Modal>

      <section className="backlog-panel">
        <div className="backlog-table-head">
          <span>Historias de usuario</span>
          <span>Prioridad</span>
          <span>Story points</span>
          <span>Tareas</span>
          <span />
        </div>

        <div className="backlog-table-body">
          {loadingHistorias ? (
            <div className="backlog-empty-state">Cargando historias...</div>
          ) : historiasFiltradas.length === 0 ? (
            <div className="backlog-empty-state">
              No hay historias para mostrar.
            </div>
          ) : (
            historiasFiltradas.map((historia) => (
              <article key={historia.id} className="backlog-row">
                <button
                  type="button"
                  className="backlog-cell backlog-cell-title"
                  onClick={() => handleOpenDetail(historia)}
                >
                  <span className="backlog-title-text">{historia.nombre}</span>
                  <span className="backlog-title-meta">
                    ID {historiaDisplayIds[String(historia.id)] ?? historia.id}{" "}
                    · {criteriaCounts[historia.id] ?? 0} criterios
                  </span>
                </button>
                <span className="backlog-pill backlog-pill-priority">
                  {historia.prioridad}
                </span>
                <span className="backlog-pill backlog-pill-points">
                  {historia.storyPoints}
                </span>
                <span className="backlog-pill backlog-pill-tasks">
                  {taskCounts[historia.id] ?? 0}
                </span>
              </article>
            ))
          )}
        </div>
      </section>

      {formOpen && (
        <div className="backlog-modal-backdrop" onClick={closeForm}>
          <div
            className="backlog-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="backlog-modal-header">
              <h2>
                {editingHistoriaId ? "Editar historia" : "Nueva historia"}
              </h2>
            </div>

            <form className="backlog-form" onSubmit={handleSubmit}>
              <label htmlFor="historia-nombre">Nombre</label>
              <input
                id="historia-nombre"
                value={form.nombre}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nombre: event.target.value }))
                }
                disabled={editingHistoriaId ? !isEditingHistoria : false}
              />

              <label htmlFor="historia-descripcion">Descripcion</label>
              <textarea
                id="historia-descripcion"
                value={form.descripcion}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    descripcion: event.target.value,
                  }))
                }
                disabled={editingHistoriaId ? !isEditingHistoria : false}
              />

              <div className="backlog-form-grid">
                <div>
                  <label htmlFor="historia-prioridad">Prioridad</label>
                  <select
                    id="historia-prioridad"
                    value={form.prioridad}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        prioridad: event.target.value,
                      }))
                    }
                    disabled={editingHistoriaId ? !isEditingHistoria : false}
                  >
                    {PRIORIDADES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="historia-storyPoints">Story points</label>
                  <input
                    id="historia-storyPoints"
                    type="number"
                    min="0"
                    value={form.storyPoints}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        storyPoints: event.target.value,
                      }))
                    }
                    disabled={editingHistoriaId ? !isEditingHistoria : false}
                  />
                </div>
              </div>

              {!editingHistoriaId && (
                <div className="backlog-form-actions">
                  <button
                    type="submit"
                    className="btn-main"
                    disabled={saving || !form.nombre.trim()}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              )}
              {editingHistoriaId && (
                <div className="backlog-edit-actions">
                  {!isEditingHistoria ? (
                    <button
                      type="button"
                      className="btn-main"
                      onClick={startEditHistoria}
                    >
                      Editar
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="btn-main"
                        disabled={saving || !form.nombre.trim()}
                      >
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </button>
                      <button
                        type="button"
                        className="btn-cerrar-modal"
                        onClick={cancelEditHistoria}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {epicaMenuOpen && (
        <div
          className="backlog-menu-overlay"
          onClick={() => {
            setEpicaMenuOpen(false);
          }}
        />
      )}
    </section>
  );
}
