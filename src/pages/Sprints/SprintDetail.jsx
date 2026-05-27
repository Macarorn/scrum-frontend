import { showError, showSuccess, showWarning, showInfo } from "../../utils/alerts";
import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { clearSessionTokens } from "../../services/auth.service";
import {
  actualizarSprint,
  obtenerSprintPorId,
} from "../../services/sprint.service";
import "../../styles/SprintBoard.css";
import "../../styles/SprintDetail.css";

const ESTADOS = ["planeado", "en_curso", "completado", "cancelado"];

const ESTADO_LABELS = {
  planeado: "Planeado",
  en_curso: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

const formatEstadoLabel = (estado) => ESTADO_LABELS[estado] || estado || "";

const formatDateInput = (value) => {
  if (!value) return "";
  const str = String(value).split("T")[0];
  if (str.match(/^\d{4}-\d{2}-\d{2}$/)) return str;
  return "";
};

const formatDateDisplay = (value) => {
  if (!value) return "-";
  const str = String(value);
  const parts = str.split(/[-T]/);

  if (parts.length >= 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("es-ES");
    }
  }

  return String(value);
};

export default function SprintDetail() {
  const navigate = useNavigate();
  const { idSprint } = useParams();
  const [searchParams] = useSearchParams();

  const [sprint, setSprint] = useState(null);
  const [form, setForm] = useState({
    id_proyecto: "",
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    meta: "",
    estado: "planeado",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const idProyecto = searchParams.get("id_proyecto") || "";

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const loadSprint = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await obtenerSprintPorId(idSprint);
        setSprint(data);
        setForm({
          id_proyecto: String(
            data.id_proyecto || data.proyectoId || idProyecto || "",
          ),
          nombre: data.nombre || "",
          fecha_inicio: formatDateInput(data.fecha_inicio),
          fecha_fin: formatDateInput(data.fecha_fin),
          meta: data.meta || "",
          estado: data.estado || "planeado",
        });
        setIsEditing(false);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        showError(err.message || "No se pudo cargar el sprint");
      setError("");
      } finally {
        setLoading(false);
      }
    };

    loadSprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSprint]);

  useEffect(() => {
    if (!projectMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest(".backlog-epica-picker"))
        return;
      setProjectMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") setProjectMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [projectMenuOpen]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isEditing) return;

    if (
      !form.id_proyecto ||
      !form.nombre.trim() ||
      !form.fecha_inicio ||
      !form.fecha_fin
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await actualizarSprint(idSprint, {
        id_proyecto: Number(form.id_proyecto),
        nombre: form.nombre.trim(),
        meta: form.meta.trim() || null,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        estado: form.estado,
      });

      setSprint(updated);
      setForm({
        id_proyecto: String(
          updated.id_proyecto || updated.proyectoId || form.id_proyecto,
        ),
        nombre: updated.nombre || "",
        fecha_inicio: formatDateInput(updated.fecha_inicio),
        fecha_fin: formatDateInput(updated.fecha_fin),
        meta: updated.meta || "",
        estado: updated.estado || "planeado",
      });
      showSuccess("Sprint actualizado correctamente");
      setSuccess("");
      setIsEditing(false);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      showError(err.message || "No se pudo actualizar el sprint");
      setError("");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (!isEditing) {
      setError("");
      setSuccess("");
      setIsEditing(true);
      return;
    }

    setForm({
      id_proyecto: String(
        sprint?.id_proyecto || sprint?.proyectoId || idProyecto || "",
      ),
      nombre: sprint?.nombre || "",
      fecha_inicio: formatDateInput(sprint?.fecha_inicio),
      fecha_fin: formatDateInput(sprint?.fecha_fin),
      meta: sprint?.meta || "",
      estado: sprint?.estado || "planeado",
    });
    setIsEditing(false);
  };

  const handleCancelarEdicion = () => {
    setForm({
      id_proyecto: String(
        sprint?.id_proyecto || sprint?.proyectoId || idProyecto || "",
      ),
      nombre: sprint?.nombre || "",
      fecha_inicio: formatDateInput(sprint?.fecha_inicio),
      fecha_fin: formatDateInput(sprint?.fecha_fin),
      meta: sprint?.meta || "",
      estado: sprint?.estado || "planeado",
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const sprintEpicas = Array.isArray(sprint?.epicas)
    ? sprint.epicas
    : Array.isArray(sprint?.epicas_asociadas)
      ? sprint.epicas_asociadas
      : Array.isArray(sprint?.epicasAsociadas)
        ? sprint.epicasAsociadas
        : [];

  return (
    <div className="sprint-detail-container">
      <main className="sprint-main">
        <div className="sprint-topbar sprint-topbar--accent">
          <div>
            <h1 className="sprint-title">
              {sprint?.nombre || `Sprint #${idSprint}`}
            </h1>
          </div>

          <div className="sprint-actions">
            <button
              type="button"
              className="btn-soft"
              onClick={() =>
                navigate(
                  `/kanban?id_proyecto=${form.id_proyecto || idProyecto}&id_sprint=${idSprint}`,
                )
              }
            >
              Abrir Kanban
            </button>
          </div>
        </div>

        

        

        {loading ? (
          <p className="sprint-list-placeholder">Cargando sprint...</p>
        ) : (
          <form className="sprint-card" onSubmit={handleSave}>
            <div className="sprint-detail-grid">
              <section className="sprint-detail-column sprint-detail-column--main">
                <button
                  className={`sprint-edit-btn sprint-edit-btn--inline ${isEditing ? "active" : ""}`}
                  onClick={handleToggleEdit}
                  type="button"
                  title={isEditing ? "Salir del modo edición" : "Editar sprint"}
                >
                  <i className="bx bxs-pencil"></i>
                </button>

                <div className="sprint-header">
                  <div className="sprint-info">
                    <div className="sprint-field">
                      <label>ID Proyecto</label>
                      <input
                        type="text"
                        className="sprint-input is-readonly"
                        value={form.id_proyecto}
                        readOnly
                      />
                    </div>

                    <div className="sprint-field">
                      <label>Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        className={`sprint-input ${isEditing ? "is-editable" : "is-readonly"}`}
                        value={form.nombre}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            nombre: event.target.value,
                          }))
                        }
                        readOnly={!isEditing}
                      />
                    </div>

                    <div className="sprint-field">
                      <label>Estado</label>
                      {isEditing ? (
                        <select
                          className="sprint-input is-editable"
                          value={form.estado}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              estado: event.target.value,
                            }))
                          }
                        >
                          {ESTADOS.map((estado) => (
                            <option key={estado} value={estado}>
                              {formatEstadoLabel(estado)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="sprint-input is-readonly"
                          value={formatEstadoLabel(form.estado)}
                          readOnly
                        />
                      )}
                    </div>

                    <div className="sprint-field">
                      <label>Fecha inicio</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="fecha_inicio"
                          className="sprint-input is-editable"
                          value={form.fecha_inicio}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              fecha_inicio: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          className="sprint-input is-readonly"
                          value={formatDateDisplay(form.fecha_inicio)}
                          readOnly
                        />
                      )}
                    </div>

                    <div className="sprint-field">
                      <label>Fecha fin</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="fecha_fin"
                          className="sprint-input is-editable"
                          value={form.fecha_fin}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              fecha_fin: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          className="sprint-input is-readonly"
                          value={formatDateDisplay(form.fecha_fin)}
                          readOnly
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="sprint-body">
                  <div className="sprint-field w-100">
                    <label>Meta</label>
                    <textarea
                      name="meta"
                      className={`sprint-textarea ${isEditing ? "is-editable" : "is-readonly"}`}
                      rows={4}
                      value={form.meta}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          meta: event.target.value,
                        }))
                      }
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="sprint-edit-actions">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={
                        saving ||
                        !form.id_proyecto ||
                        !form.nombre.trim() ||
                        !form.fecha_inicio ||
                        !form.fecha_fin
                      }
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancelarEdicion}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </section>

              <aside className="sprint-detail-column sprint-detail-column--side">
                <div className="sprint-epicas-panel">
                  <div className="sprint-epicas-header">
                    <div>
                      <h2 className="sprint-epicas-title">Epicas del sprint</h2>
                    </div>
                    <span className="sprint-epicas-count">
                      {sprintEpicas.length}
                    </span>
                  </div>

                  {sprintEpicas.length > 0 ? (
                    <div className="sprint-epicas-list">
                      {sprintEpicas.map((epica) => (
                        <article
                          key={epica.id_epica || epica.id}
                          className="sprint-epica-chip"
                        >
                          <div>
                            <h3>
                              {epica.nombre ||
                                epica.titulo ||
                                `Épica ${epica.id_epica || epica.id}`}
                            </h3>
                            <p>
                              {epica.descripcion ||
                                epica.categoria ||
                                "Sin descripción"}
                            </p>
                          </div>
                          {epica.estado ? <span>{epica.estado}</span> : null}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="sprint-epicas-empty">
                      <strong>No hay épicas asociadas todavía.</strong>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
