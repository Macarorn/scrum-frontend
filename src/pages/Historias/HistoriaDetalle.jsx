import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { clearSessionTokens } from "../../services/auth.service";
import { obtenerEpica } from "../../services/epicas.service";
import {
  actualizarHistoria,
  crearCriterioHistoria,
  eliminarHistoria,
  listarCriteriosHistoria,
  listarHistoriasPorEpica,
  obtenerHistoria,
} from "../../services/historias.service";
import { crearTarea } from "../../services/sprint.service";
import { contarTareasPorHistoria } from "../../services/tareas.service";
import "../../styles/Epicas.css";

export default function HistoriaDetalle() {
  const navigate = useNavigate();
  const { idHistoria } = useParams();
  const [searchParams] = useSearchParams();

  const [historia, setHistoria] = useState(null);
  const [epica, setEpica] = useState(null);
  const [criterios, setCriterios] = useState([]);
  const [displayHistoriaId, setDisplayHistoriaId] = useState("");
  const [draft, setDraft] = useState({
    nombre: "",
    descripcion: "",
    prioridad: 3,
    storyPoints: 3,
  });
  const [originalDraft, setOriginalDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nuevoCriterio, setNuevoCriterio] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingHistoria, setSavingHistoria] = useState(false);
  const [savingCriterio, setSavingCriterio] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [nextTaskNumber, setNextTaskNumber] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  const clearMessages = () => {
    setError("");
    setInfo("");
  };

  const idEpicaParam = searchParams.get("id_epica") || "";
  const idProyecto = searchParams.get("id_proyecto") || "";

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  const epicaLabel = useMemo(() => {
    if (epica?.nombre) {
      return epica.nombre;
    }

    if (historia?.epicaId) {
      return `Epica ${historia.epicaId}`;
    }

    return "Epica";
  }, [epica, historia]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const historiaData = await obtenerHistoria(idHistoria);
        setHistoria(historiaData);
        const nextDraft = {
          nombre: historiaData.nombre || "",
          descripcion: historiaData.descripcion || "",
          prioridad: historiaData.prioridad || 3,
          storyPoints: historiaData.storyPoints || 3,
        };
        setDraft(nextDraft);
        setOriginalDraft(nextDraft);
        setIsEditing(false);

        const epicaId = idEpicaParam || historiaData.epicaId;
        if (epicaId) {
          const epicaData = await obtenerEpica(epicaId);
          setEpica(epicaData);

          const historiasEpica = (await listarHistoriasPorEpica(epicaId)) || [];
          const ordered = [...historiasEpica].sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
          const index = ordered.findIndex((item) => String(item.id) === String(historiaData.id));
          setDisplayHistoriaId(index >= 0 ? String(index + 1) : String(historiaData.id));
        } else {
          setDisplayHistoriaId(String(historiaData.id));
        }

        const criteriosData = await listarCriteriosHistoria(idHistoria);
        setCriterios(criteriosData || []);

        // Obtener el próximo número de tarea para esta historia
        const count = await contarTareasPorHistoria(idHistoria);
        setNextTaskNumber(count + 1);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudo cargar la historia");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idHistoria]);

  const handleSaveHistoria = async () => {
    if (!historia?.id || !draft.nombre.trim()) return;

    setSavingHistoria(true);
    setError("");

    try {
      const updated = await actualizarHistoria(historia.id, {
        nombre: draft.nombre.trim(),
        epicaId: historia.epicaId,
        descripcion: draft.descripcion.trim(),
        prioridad: Number(draft.prioridad),
        storyPoints: Number(draft.storyPoints),
      });

      setHistoria(updated);
      const nextDraft = {
        nombre: updated.nombre || "",
        descripcion: updated.descripcion || "",
        prioridad: updated.prioridad || 3,
        storyPoints: updated.storyPoints || 3,
      };
      setDraft(nextDraft);
      setOriginalDraft(nextDraft);
      setIsEditing(false);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo guardar la historia");
    } finally {
      setSavingHistoria(false);
    }
  };

  const handleStartEdit = () => {
    clearMessages();
    setOpenMenu(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (originalDraft) {
      setDraft(originalDraft);
    }
    clearMessages();
    setIsEditing(false);
  };

  const handleAddCriterio = async () => {
    if (!historia?.id || !nuevoCriterio.trim()) return;

    setSavingCriterio(true);
    setError("");

    try {
      await crearCriterioHistoria(historia.id, nuevoCriterio.trim());
      const criteriosData = await listarCriteriosHistoria(historia.id);
      setCriterios(criteriosData || []);
      setNuevoCriterio("");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo crear el criterio");
    } finally {
      setSavingCriterio(false);
    }
  };

  const handleDeleteHistoria = async () => {
    if (!historia?.id) return;

    const confirmed = window.confirm(`Quieres borrar la historia "${historia.nombre}"?`);
    if (!confirmed) return;

    try {
      await eliminarHistoria(historia.id);
      navigate(`/epicas/${historia.epicaId || idEpicaParam}?id_proyecto=${idProyecto}`);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo eliminar la historia");
    }
  };

  const handleCreateTask = async () => {
    if (!historia?.id) return;

    const defaultName = `Tarea de ${draft.nombre || `Historia ${historia.id}`}`;
    const nombre = window.prompt("Nombre de la tarea", defaultName);
    if (!nombre || !nombre.trim()) return;

    setCreatingTask(true);
    setError("");
    setInfo("");

    try {
      const creada = await crearTarea({
        nombre: nombre.trim(),
        descripcion: draft.descripcion?.trim() || "",
        id_historia: Number(historia.id),
        prioridad: "media",
        tipo: "otro",
      });

      const sprintResuelto = creada?.data?.id_sprint_resuelto ?? creada?.id_sprint_resuelto ?? null;
      if (!sprintResuelto) {
        setInfo(
          "Tarea creada correctamente. No encontramos un sprint disponible para asignar la historia automaticamente.",
        );
        return;
      }

      try {
        sessionStorage.setItem("scrum.flash.success", "Tarea creada correctamente");
      } catch {
        // ignore storage failures
      }

      const queryProyecto = idProyecto ? `id_proyecto=${idProyecto}&` : "";
      navigate(`/kanban?${queryProyecto}id_sprint=${sprintResuelto}`, {
        state: { toastMessage: "Tarea creada correctamente" },
      });
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo crear la tarea");
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) {
    return (
      <section className="epicas-page">
        <p className="epicas-placeholder">Cargando historia...</p>
      </section>
    );
  }

  if (error && !historia) {
    return (
      <section className="epicas-page">
        <Alert variant="danger" className="shadow-sm mb-3" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      </section>
    );
  }

  return (
    <section className="epicas-page">
      <header className="epicas-header">
        <div>
          <h1>Historia de Usuario</h1>
          <p>{epicaLabel}</p>
        </div>
        <div className="epicas-form-buttons">
          <button
            type="button"
            className="btn-create-task"
            onClick={handleCreateTask}
            disabled={creatingTask}
          >
            {creatingTask
              ? "Creando tarea..."
              : `Crear tarea de esta historia (ID ${nextTaskNumber ?? "-"})`}
          </button>
          <button
            type="button"
            className="btn-soft"
            onClick={() => navigate(`/epicas/${historia?.epicaId || idEpicaParam}?id_proyecto=${idProyecto}`)}
          >
            Volver
          </button>
        </div>
      </header>

      {(error || info) && (
        <Alert
          variant={error ? "danger" : "success"}
          className="shadow-sm mb-3"
          dismissible
          onClose={clearMessages}
        >
          <strong className="d-block mb-1">{error ? "No se pudo crear la tarea" : "Tarea creada"}</strong>
          <span>{error || info}</span>
        </Alert>
      )}

      <div className="historia-edit-layout">
        <article className={`epica-detail-card historia-main-card${isEditing ? " edit-mode-on" : ""}`}>
          <div className="historia-title-row">
            <div>
              <h2 className="historia-title-editable">
                {draft.nombre || "Sin nombre"}
              </h2>
              <p className="historia-epica-link">{epicaLabel}</p>
            </div>
            <div className="historia-actions-wrap">
              <button
                type="button"
                className="historia-menu-trigger"
                onClick={() => setOpenMenu((prev) => !prev)}
                aria-label="Abrir acciones"
              >
                ⋮
              </button>
              {openMenu && (
                <div className="historia-menu">
                  <button type="button" className="danger" onClick={handleDeleteHistoria}>
                    Borrar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="epicas-detail-actions">
            {!isEditing ? (
              <button type="button" className="btn-main" onClick={handleStartEdit}>
                Editar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-main"
                  onClick={handleSaveHistoria}
                  disabled={savingHistoria || !draft.nombre.trim()}
                >
                  {savingHistoria ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  className="btn-soft"
                  onClick={handleCancelEdit}
                  disabled={savingHistoria}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>

          <div className="historia-meta-grid">
            <div>
              <label htmlFor="historia-id">ID:<span className="historia-required"></span></label>
              <input id="historia-id" value={displayHistoriaId || historia.id} readOnly />
            </div>

            <div>
              <label htmlFor="historia-epica">Épica</label>
              <input id="historia-epica" value={historia.epicaId || ""} readOnly />
            </div>

            <div>
              <label htmlFor="historia-prioridad">Prioridad:<span className="historia-required"></span></label>
              <select
                className="editable-control"
                id="historia-prioridad"
                value={draft.prioridad}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, prioridad: event.target.value }))
                }
                disabled={!isEditing}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="historia-story-points">Story Points</label>
              <input
                className="editable-control"
                id="historia-story-points"
                type="number"
                min="1"
                step="1"
                value={draft.storyPoints}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, storyPoints: event.target.value }))
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="historia-field-block">
            <label htmlFor="historia-nombre">Nombre de la historia<span className="historia-required"></span></label>
            <input
              className="editable-control"
              id="historia-nombre"
              value={draft.nombre}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, nombre: event.target.value }))
              }
              disabled={!isEditing}
            />
          </div>

          <div className="historia-field-block historia-description-block">
            <label htmlFor="historia-descripcion">Descripción:</label>
            <textarea
              className="editable-control"
              id="historia-descripcion"
              placeholder="Aquí puedes poner tu descripción"
              value={draft.descripcion}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, descripcion: event.target.value }))
              }
              disabled={!isEditing}
            />
          </div>
        </article>

        <section className="epica-historias-card historia-criterios-card">
          <div className="historia-criterios-header">
            <div>
              <h3>Criterios de aceptación</h3>
              <p className="historia-criterios-subtitle">Define las condiciones para dar esta historia por completada.</p>
            </div>
            <span className="historia-criterios-count">{criterios.length} criterios</span>
          </div>

          {criterios.length === 0 ? (
            <p className="historia-criterios-empty">Aún no hay criterios. Agrega el primero para iniciar la validación.</p>
          ) : (
            <div className="historia-criterios-box">
              <ul className="criterios-list historia-criterios-list">
              {criterios.map((criterio) => (
                <li key={criterio.id}>
                  <span className="criterio-text">{criterio.descripcion}</span>
                </li>
              ))}
              </ul>
            </div>
          )}

          <div className="historia-criterio-form">
            <input
              className="editable-control"
              type="text"
              placeholder="Escribe un criterio de aceptación"
              value={nuevoCriterio}
              onChange={(event) => setNuevoCriterio(event.target.value)}
              disabled={!isEditing}
            />
            <button
              type="button"
              className="btn-main"
              onClick={handleAddCriterio}
              disabled={!isEditing || savingCriterio || !nuevoCriterio.trim()}
            >
              {savingCriterio ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </section>
      </div>

      {openMenu && <div className="historia-menu-overlay" onClick={() => setOpenMenu(false)} />}
    </section>
  );
}
