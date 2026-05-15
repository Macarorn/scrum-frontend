import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { clearSessionTokens } from "../../services/auth.service";
import { actualizarSprint, obtenerSprintPorId } from "../../services/sprint.service";
import "../../styles/SprintList.css";
import { showError, showSuccess, showWarning } from "../../utils/alerts";

const ESTADOS = ["planeado", "en_curso", "completado", "cancelado"];

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

  const idProyecto = searchParams.get("id_proyecto") || "";
  const isReadOnly = searchParams.get("view") === "1";

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
          id_proyecto: String(data.id_proyecto || data.proyectoId || idProyecto || ""),
          nombre: data.nombre || "",
          fecha_inicio: data.fecha_inicio ? String(data.fecha_inicio).slice(0, 10) : "",
          fecha_fin: data.fecha_fin ? String(data.fecha_fin).slice(0, 10) : "",
          meta: data.meta || "",
          estado: data.estado || "planeado",
        });
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudo cargar el sprint");
        showError(err.message || "Ocurrió un error");
      } finally {
        setLoading(false);
      }
    };

    loadSprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idSprint]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (isReadOnly) return;

    const faltaFecha = !form.fecha_inicio || !form.fecha_fin;
    const faltaOtro = !form.id_proyecto || !form.nombre.trim();

    if (faltaFecha && faltaOtro) {
      showWarning("Todos los campos son obligatorios");
      return;
    }

    if (faltaFecha) {
      showError("La fecha es obligatoria");
      return;
    }

    if (form.fecha_inicio > form.fecha_fin) {
      showError("La fecha de fin debe ser posterior a la fecha de inicio");
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
        id_proyecto: String(updated.id_proyecto || updated.proyectoId || form.id_proyecto),
        nombre: updated.nombre || "",
        fecha_inicio: updated.fecha_inicio ? String(updated.fecha_inicio).slice(0, 10) : "",
        fecha_fin: updated.fecha_fin ? String(updated.fecha_fin).slice(0, 10) : "",
        meta: updated.meta || "",
        estado: updated.estado || "planeado",
      });
      showSuccess("Sprint actualizado correctamente");

    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo actualizar el sprint");
      showError(err.message || "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="sprint-list-page">
      <header className="sprint-list-header">
        <div>
          <p className="sprint-list-tag">Sprint</p>
          <h1 className="sprint-list-title">Detalle de Sprint</h1>
          <p className="sprint-list-project-current">{sprint?.nombre || `Sprint #${idSprint}`}</p>
        </div>

        <div className="sprint-list-actions">
          <button
            type="button"
            className="btn-soft"
            onClick={() => navigate(`/sprints?id_proyecto=${form.id_proyecto || idProyecto}`)}
          >
            Volver a sprints
          </button>
          <button
            type="button"
            className="btn-backlog"
            onClick={() => navigate(`/kanban?id_proyecto=${form.id_proyecto || idProyecto}&id_sprint=${idSprint}`)}
          >
            Abrir Kanban
          </button>
        </div>
      </header>


      {loading ? (
        <p className="sprint-list-placeholder">Cargando sprint...</p>
      ) : (
        <article className="sprint-list-form-card">
          <h2>{isReadOnly ? "Ver sprint" : "Editar sprint"}</h2>
          <form className="sprint-list-form" onSubmit={handleSave} noValidate>
            <label htmlFor="detail-id-proyecto">ID Proyecto</label>
            <input
              id="detail-id-proyecto"
              value={form.id_proyecto}
              onChange={(event) => setForm((prev) => ({ ...prev, id_proyecto: event.target.value }))}
              disabled={isReadOnly}
            />

            <label htmlFor="detail-nombre">Nombre</label>
            <input
              id="detail-nombre"
              value={form.nombre}
              onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
              disabled={isReadOnly}
            />

            <label htmlFor="detail-fecha-inicio">Fecha inicio</label>
            <input
              id="detail-fecha-inicio"
              type="date"
              value={form.fecha_inicio}
              onChange={(event) => setForm((prev) => ({ ...prev, fecha_inicio: event.target.value }))}
              disabled={isReadOnly}
            />

            <label htmlFor="detail-fecha-fin">Fecha fin</label>
            <input
              id="detail-fecha-fin"
              type="date"
              value={form.fecha_fin}
              onChange={(event) => setForm((prev) => ({ ...prev, fecha_fin: event.target.value }))}
              disabled={isReadOnly}
            />

            <label htmlFor="detail-estado">Estado</label>
            <select
              id="detail-estado"
              value={form.estado}
              onChange={(event) => setForm((prev) => ({ ...prev, estado: event.target.value }))}
              disabled={isReadOnly}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <label htmlFor="detail-meta">Meta</label>
            <textarea
              id="detail-meta"
              value={form.meta}
              onChange={(event) => setForm((prev) => ({ ...prev, meta: event.target.value }))}
              disabled={isReadOnly}
            />

            {!isReadOnly && (
              <button
                type="submit"
                className="btn-main"
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
            )}
          </form>
        </article>
      )}
    </section>
  );
}
