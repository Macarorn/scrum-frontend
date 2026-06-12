import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  Link,
} from "react-router-dom";
import { clearSessionTokens, canEditBacklog } from "../../services/auth.service";
import { editarEpica, obtenerEpica } from "../../services/epicas.service";
import { crearHistoria, listarHistoriasPorEpica } from "../../services/historias.service";
import VisualPrioritySelector from "../../components/VisualPrioritySelector";
import "../../styles/Epicas.css";

const PRIORIDADES = [
  { valor: 1, label: "1 - Muy Baja (No urgente)" },
  { valor: 2, label: "2 - Baja" },
  { valor: 3, label: "3 - Media (Normal)" },
  { valor: 4, label: "4 - Alta (Importante)" },
  { valor: 5, label: "5 - Crítica (Bloqueante)" }
];

const ESTADOS_EPICA = ["por_hacer", "en_progreso", "completada", "cancelada"];

const ESTADO_LABELS = {
  por_hacer: "Por hacer",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada",
};

const formatEstadoLabel = (estado) => ESTADO_LABELS[estado] || estado || "";

export default function EpicaDetalle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { idEpica } = useParams();
  const [searchParams] = useSearchParams();

  const [epica, setEpica] = useState(null);
  const [historias, setHistorias] = useState([]);
  const [draft, setDraft] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    prioridad: 3,
    estado: "por_hacer",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [showHistoriaForm, setShowHistoriaForm] = useState(false);
  const [historiaForm, setHistoriaForm] = useState({
    nombre: "",
    descripcion: "",
    prioridad: 3,
    storyPoints: 1,
  });
  const [savingHistoria, setSavingHistoria] = useState(false);

  const idProyecto = searchParams.get("id_proyecto") || "";

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  // Cargar permisos del usuario en el proyecto
  useEffect(() => {
    const loadPermissions = async () => {
      if (idProyecto) {
        const hasPermission = await canEditBacklog(idProyecto);
        setCanEdit(hasPermission);
      }
    };
    loadPermissions();
  }, [idProyecto]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [epicaData, historiasData] = await Promise.all([
          obtenerEpica(idEpica),
          listarHistoriasPorEpica(idEpica),
        ]);

        setEpica(epicaData);
        setDraft({
          nombre: epicaData.nombre || "",
          descripcion: epicaData.descripcion || "",
          categoria: epicaData.categoria || "",
          prioridad: epicaData.prioridad || 3,
          estado: epicaData.estado || "por_hacer",
        });
        setIsEditing(false);
        setHistorias(historiasData || []);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }
        showError(err.message || "No se pudo cargar el detalle de la epica");
        setError("");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEpica]);

  useEffect(() => {
    const message = location.state?.toastMessage;
    if (!message) return;

    setToastMessage(message);
    const timeout = setTimeout(() => {
      setToastMessage("");
      navigate(location.pathname + location.search, {
        replace: true,
        state: {},
      });
    }, 2600);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search, location.state, navigate]);

  const handleOpenHistoriaForm = () => {
    setHistoriaForm({ nombre: "", descripcion: "", prioridad: 3, storyPoints: 1 });
    setShowHistoriaForm(true);
  };

  const handleCloseHistoriaForm = () => {
    setShowHistoriaForm(false);
  };

  const handleCreateHistoria = async (event) => {
    event.preventDefault();
    if (!epica?.id || !historiaForm.nombre.trim()) return;

    setSavingHistoria(true);
    try {
      await crearHistoria({
        nombre: historiaForm.nombre.trim(),
        epicaId: Number(epica.id),
        descripcion: historiaForm.descripcion.trim(),
        prioridad: Number(historiaForm.prioridad),
        storyPoints: Number(historiaForm.storyPoints),
      });

      const historiasData = await listarHistoriasPorEpica(idEpica);
      setHistorias(historiasData || []);
      setShowHistoriaForm(false);
      showSuccess("Historia creada correctamente");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      showError(err.message || "No se pudo crear la historia");
    } finally {
      setSavingHistoria(false);
    }
  };

  const handleStartEdit = () => {
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (epica) {
      setDraft({
        nombre: epica.nombre || "",
        descripcion: epica.descripcion || "",
        categoria: epica.categoria || "",
        prioridad: epica.prioridad || 3,
        estado: epica.estado || "por_hacer",
      });
    }
    setError("");
    setSuccess("");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!epica?.id && !epica?.id_epica) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await editarEpica(epica.id || epica.id_epica, {
        proyectoId: epica.proyectoId || epica.id_proyecto,
        nombre: draft.nombre.trim(),
        descripcion: draft.descripcion.trim() || null,
        categoria: draft.categoria.trim() || null,
        prioridad: Number(draft.prioridad) || 3,
        estado: draft.estado,
      });

      setEpica(updated);
      setDraft({
        nombre: updated.nombre || "",
        descripcion: updated.descripcion || "",
        categoria: updated.categoria || "",
        prioridad: updated.prioridad || 3,
        estado: updated.estado || "por_hacer",
      });
      setIsEditing(false);
      showSuccess("Epica actualizada correctamente");
      setSuccess("");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      showError(err.message || "No se pudo actualizar la epica");
      setError("");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="epicas-page">
        <p className="epicas-placeholder">Cargando epica...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="epicas-page">
        <Alert
          variant="danger"
          className="shadow-sm mb-3"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      </section>
    );
  }

  if (!epica) {
    return (
      <section className="epicas-page">
        <p className="epicas-placeholder">Epica no encontrada.</p>
      </section>
    );
  }

  return (
    <section className="epicas-page">
      <header className="epicas-header">
        <div>
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0" style={{ fontSize: '0.875rem' }}>
              <li className="breadcrumb-item"><Link to="/proyectos" className="text-decoration-none text-muted">Proyectos</Link></li>
              {idProyecto && <li className="breadcrumb-item"><Link to={`/detalles_de_proyecto/${idProyecto}`} className="text-decoration-none text-muted">Proyecto</Link></li>}
              <li className="breadcrumb-item"><Link to={`/epicas?id_proyecto=${idProyecto}`} className="text-decoration-none text-muted">Épicas</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Épica #{epica.id || epica.id_epica}</li>
            </ol>
          </nav>
          <h1 className="mb-0">{epica.nombre}</h1>
        </div>
        <div className="epicas-form-buttons">
          <button
            type="button"
            className="btn-soft"
            onClick={() => navigate(`/epicas?id_proyecto=${idProyecto}`)}
          >
            Volver
          </button>
        </div>
      </header>



      <div className="epica-detail-layout">
        <article className="epica-detail-card">
          {!isEditing && canEdit && (
            <button
              type="button"
              className="epica-pencil-btn epica-pencil-btn--floating"
              onClick={handleStartEdit}
              aria-label="Editar épica"
              title="Editar épica"
            >
              <span className="epica-pencil-icon" aria-hidden="true">
                ✎
              </span>
            </button>
          )}

          <div className="epica-detail-grid">
            <div className="epica-detail-field epica-detail-field--compact">
              <strong>Nombre</strong>
              {isEditing ? (
                <input
                  value={draft.nombre}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      nombre: event.target.value,
                    }))
                  }
                />
              ) : (
                <div className="epica-read-value">{epica.nombre}</div>
              )}
            </div>
            <div className="epica-detail-field epica-detail-field--compact">
              <strong>Categoria</strong>
              {isEditing ? (
                <input
                  value={draft.categoria}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      categoria: event.target.value,
                    }))
                  }
                />
              ) : (
                <div className="epica-read-value">
                  {epica.categoria || "Sin categoria"}
                </div>
              )}
            </div>
            <div className="epica-detail-field epica-detail-field--compact">
              <strong>Prioridad</strong>
              {isEditing ? (
                <VisualPrioritySelector
                  type="epica"
                  value={draft.prioridad}
                  onChange={(val) =>
                    setDraft((prev) => ({
                      ...prev,
                      prioridad: val,
                    }))
                  }
                  disabled={false}
                />
              ) : (
                <div className="epica-read-value">
                  {PRIORIDADES.find((p) => p.valor === Number(epica.prioridad))?.label || epica.prioridad}
                </div>
              )}
            </div>
            <div className="epica-detail-field epica-detail-field--compact">
              <strong>Estado</strong>
              {isEditing ? (
                <select
                  value={draft.estado}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      estado: event.target.value,
                    }))
                  }
                >
                  {ESTADOS_EPICA.map((estado) => (
                    <option key={estado} value={estado}>
                      {formatEstadoLabel(estado)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="epica-read-value">
                  {formatEstadoLabel(epica.estado)}
                </div>
              )}
            </div>
          </div>
          <div className="epica-detail-field epica-detail-field--wide">
            <strong>Descripcion</strong>
            {isEditing ? (
              <textarea
                value={draft.descripcion}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    descripcion: event.target.value,
                  }))
                }
              />
            ) : (
              <div className="epica-read-value epica-read-value--multiline">
                {epica.descripcion || "Sin descripción"}
              </div>
            )}
          </div>

          {isEditing && (
            <div
              className="epicas-detail-actions"
              style={{ marginTop: "16px" }}
            >
              <button
                type="button"
                className="btn-main"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                className="btn-cerrar-modal"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          )}
        </article>

        <section className="epica-historias-card">
          <div className="epica-historias-header">
            <h3>Historias de usuario</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="historia-criterios-count">
                {historias.length} historias
              </span>
              {canEdit && (
                <button
                  type="button"
                  className="btn-dashed"
                  onClick={handleOpenHistoriaForm}
                >
                  + Nueva historia
                </button>
              )}
            </div>
          </div>
          {historias.length === 0 ? (
            <p className="historia-criterios-empty">
              No hay historias asociadas a esta épica.
            </p>
          ) : (
            <div className="historias-list">
              {historias.map((historia) => (
                <button
                  key={historia.id}
                  type="button"
                  className="historia-item"
                  onClick={() =>
                    navigate(
                      `/historias/${historia.id}?id_epica=${epica.id}&id_proyecto=${idProyecto}`,
                    )
                  }
                >
                  <span className="historia-item-name">{historia.nombre}</span>
                  <small className="historia-item-id">#{historia.id}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {showHistoriaForm && (
        <div className="backlog-modal-backdrop" onClick={handleCloseHistoriaForm}>
          <div
            className="backlog-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="backlog-modal-header">
              <h2>Nueva historia</h2>
            </div>
            <form className="backlog-form" onSubmit={handleCreateHistoria}>
              <label htmlFor="historia-nombre">Nombre</label>
              <input
                id="historia-nombre"
                value={historiaForm.nombre}
                onChange={(event) =>
                  setHistoriaForm((prev) => ({
                    ...prev,
                    nombre: event.target.value,
                  }))
                }
              />

              <label htmlFor="historia-descripcion">Descripcion</label>
              <textarea
                id="historia-descripcion"
                value={historiaForm.descripcion}
                onChange={(event) =>
                  setHistoriaForm((prev) => ({
                    ...prev,
                    descripcion: event.target.value,
                  }))
                }
              />

              <div className="backlog-form-grid">
                <div>
                  <label htmlFor="historia-prioridad">Prioridad</label>
                  <select
                    id="historia-prioridad"
                    value={historiaForm.prioridad}
                    onChange={(event) =>
                      setHistoriaForm((prev) => ({
                        ...prev,
                        prioridad: event.target.value,
                      }))
                    }
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
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
                    value={historiaForm.storyPoints}
                    onChange={(event) =>
                      setHistoriaForm((prev) => ({
                        ...prev,
                        storyPoints: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn-cerrar-modal"
                  onClick={handleCloseHistoriaForm}
                  disabled={savingHistoria}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-main"
                  disabled={savingHistoria || !historiaForm.nombre.trim()}
                >
                  {savingHistoria ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="epica-toast" role="status" aria-live="polite">
          <div className="epica-toast-text">{toastMessage}</div>
          <span className="epica-toast-icon" aria-hidden="true">
            ✓
          </span>
        </div>
      )}
    </section>
  );
}
