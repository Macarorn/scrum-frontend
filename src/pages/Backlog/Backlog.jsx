import API_URL from "../../services/api";
import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import BacklogTopbar from "./BacklogTopbar";
import BacklogHistoriaList from "./BacklogHistoriaList";
import BacklogHistoriaForm from "./BacklogHistoriaForm";
import {
  clearSessionTokens,
  getAccessToken,
  canEditBacklog,
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
import { listarProyectos } from "../../services/proyectos.service";
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
  const [loadingEpicas, setLoadingEpicas] = useState(false);
  const [loadingHistorias, setLoadingHistorias] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showEpicaModal, setShowEpicaModal] = useState(false);
  const [dontShowEpicaModal, setDontShowEpicaModal] = useState(() => {
    const saved = localStorage.getItem("scrum.dont_show_epica_modal");
    return saved === "true";
  });
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const [processingConfirm] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    body: "",
    confirmLabel: "Aceptar",
    cancelLabel: "Cancelar",
    onConfirm: null,
  });
  const [editingHistoriaId, setEditingHistoriaId] = useState(null);
  const [isEditingHistoria, setIsEditingHistoria] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    prioridad: 3,
    storyPoints: 3,
  });

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

  const goToNewEpica = () => {
    if (selectedProyecto) {
      navigate(`/epicas/crear?id_proyecto=${selectedProyecto}`);
    }
  };

  const goToEpicasOverview = () => {
    if (selectedProyecto) {
      navigate(`/epicas?id_proyecto=${selectedProyecto}`);
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await listarProyectos();
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
        const hasPerms = await canEditBacklog(selectedProyecto);
        setCanEdit(hasPerms);

        const token = getAccessToken();
        if (!token) {
          throw { code: "UNAUTHENTICATED" };
        }

        const response = await fetch(
          `${API_URL}/epicas?proyectoId=${selectedProyecto}`,
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
      const pairs = await Promise.all(
        epicas.map(async (epica) => {
          try {
            const items = (await listarHistoriasPorEpica(epica.id)) || [];
            return [epica.id, items.length];
          } catch {
            return [epica.id, 0];
          }
        }),
      );

      setEpicaCounts(Object.fromEntries(pairs));
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

    if (!selectedEpica || !form.nombre.trim()) return;

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
        editingHistoriaId ? "Guardado correctamente" : "Creado correctamente",
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

  return (
    <section className="backlog-page">
      <BacklogTopbar 
        proyectos={proyectos}
        selectedProyecto={selectedProyecto}
        epicas={epicas}
        selectedEpica={selectedEpica}
        loading={loading}
        loadingEpicas={loadingEpicas}
        epicaCounts={epicaCounts}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSelectedProyecto={setSelectedProyecto}
        setActiveProjectId={setActiveProjectId}
        setSelectedEpica={setSelectedEpica}
        setEpicas={setEpicas}
        setHistorias={setHistorias}
        setCriteriaCounts={setCriteriaCounts}
        syncQuery={syncQuery}
        navigate={navigate}
        openNewHistoria={openNewHistoria}
        epicaLabel={epicaLabel}
        canEdit={canEdit}
      />

      {!error && !loading && proyectos.length === 0 && (
        <p className="backlog-feedback">No hay proyectos disponibles.</p>
      )}

      {!loadingEpicas && selectedProyecto && epicas.length === 0 && (
        <div className="backlog-empty-state-inline p-4 mb-4 bg-white border rounded shadow-sm text-center">
          <h4 className="fw-semibold mb-2">¡Crea la primera épica de tu proyecto!</h4>
          <p className="text-muted mb-4">
            Necesitas al menos una épica para poder organizar historias en el backlog.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-success" onClick={goToNewEpica}>+ Nueva Épica</button>
            <button className="btn btn-outline-success" onClick={goToEpicasOverview}>Ver épicas del proyecto</button>
          </div>
        </div>
      )}

      <BacklogHistoriaList 
        loadingHistorias={loadingHistorias}
        historiasFiltradas={historiasFiltradas}
        handleOpenDetail={handleOpenDetail}
        historiaDisplayIds={historiaDisplayIds}
        criteriaCounts={criteriaCounts}
      />

      <BacklogHistoriaForm 
        formOpen={formOpen}
        closeForm={closeForm}
        editingHistoriaId={editingHistoriaId}
        isEditingHistoria={isEditingHistoria}
        form={form}
        setForm={setForm}
        handleSubmit={handleSubmit}
        saving={saving}
        startEditHistoria={startEditHistoria}
        cancelEditHistoria={cancelEditHistoria}
        PRIORIDADES={PRIORIDADES}
      />

      {/* Confirm Modal */}
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
      </Modal>

      {epicaMenuOpen && (
        <div
          className="backlog-menu-overlay"
          onClick={() => {
            setEpicaMenuOpen(false);
          }}
        />
      )}
>>>>>>> 4d3af18d28f88dc950d73c5832504133e1d1c54e
    </section>
  );
}
