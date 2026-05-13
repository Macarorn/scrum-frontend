import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/Epicas.css";
import { clearSessionTokens } from "../../services/auth.service";
import { crearEpica } from "../../services/epicas.service";
import { getActiveProjectId, setActiveProjectId } from "../../services/project-context.service";
import { listarProyectos } from "../../services/proyectos.service";
import { showError, showSuccess, showWarning } from "../../utils/alerts";

const ESTADOS_EPICA = ["por_hacer", "en_progreso", "completada", "cancelada"];
const INITIAL_FORM = {
  nombre: "",
  descripcion: "",
  categoria: "",
  prioridad: 3,
  estado: "por_hacer",
};

export default function EpicaForm() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(
    searchParams.get("id_proyecto") || getActiveProjectId() || "",
  );
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await listarProyectos();
        const items = response.data || [];
        setProyectos(items);

        if (items.length === 0) {
          setSelectedProyecto("");
          setActiveProjectId("");
          setSearchParams({}, { replace: true });
          return;
        }

        const exists = items.some((item) => String(item.id_proyecto) === String(selectedProyecto));
        const nextProject = exists ? selectedProyecto : String(items[0].id_proyecto);
        setSelectedProyecto(nextProject);
        setActiveProjectId(nextProject);
        setSearchParams({ id_proyecto: nextProject }, { replace: true });
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar los proyectos");
        showError(err.message || "Ocurrió un error");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // close project picker when clicking outside or pressing Escape
  useEffect(() => {
    if (!projectMenuOpen) return undefined;

    const handleOutside = (event) => {
      if (event.target.closest && event.target.closest('.backlog-epica-picker')) return;
      setProjectMenuOpen(false);
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') setProjectMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [projectMenuOpen]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!isEditing) return;
    if (!selectedProyecto || !form.nombre.trim()) {
      showWarning("Completa todos los campos");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = await crearEpica({
        proyectoId: Number(selectedProyecto),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria.trim() || null,
        prioridad: Number(form.prioridad) || 3,
        estado: form.estado,
      });

      const idEpica = data?.id_epica ?? data?.id;
      showSuccess("Épica creada correctamente");
      navigate(`/epicas/${idEpica}?id_proyecto=${selectedProyecto}`);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo crear la epica");
      showError(err.message || "Ocurrió un error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="epicas-page">
      <header className="epicas-header">
        <div>
          <h1>Nueva epica</h1>
          <p className="epicas-project-current">
            {proyectos.find((item) => String(item.id_proyecto) === String(selectedProyecto))?.nombre || "Sin proyecto"}
          </p>
        </div>

        <div className="epicas-form-buttons">
          <button
            type="button"
            className="btn-soft"
            onClick={() => navigate(`/epicas?id_proyecto=${selectedProyecto}`)}
          >
            Volver
          </button>
        </div>
      </header>

      {error && (
        <Alert variant="danger" className="shadow-sm mb-3" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <section className="epica-form-page-card">
        <form className="epicas-form-card" onSubmit={handleCreate} noValidate>
          <div className="epicas-form-buttons">
            {!isEditing ? (
              <button
                type="button"
                className="btn-main"
                onClick={() => setIsEditing(true)}
                disabled={loading || proyectos.length === 0}
              >
                Editar
              </button>
            ) : (
              <button
                type="button"
                className="btn-soft"
                onClick={() => {
                  setForm(INITIAL_FORM);
                  setIsEditing(false);
                }}
                disabled={saving}
              >
                Cancelar
              </button>
            )}
          </div>

          <label>Proyecto</label>
          <div className="backlog-epica-picker">
            <button
              type="button"
              className="backlog-epica-toggle"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const shouldRight = window.innerWidth - rect.right < 360;
                setProjectMenuRight(shouldRight);
                setProjectMenuOpen((prev) => !prev);
              }}
              disabled={!isEditing || loading || proyectos.length === 0}
            >
              <span>{proyectos.find((p) => String(p.id_proyecto) === String(selectedProyecto))?.nombre || "Sin proyecto"}</span>
              <span className="backlog-epica-caret">▾</span>
            </button>

            {projectMenuOpen && (
              <div className={`backlog-epica-menu ${projectMenuRight ? "menu-right" : ""}`} role="menu">
                <div className="backlog-epica-menu-list">
                  {proyectos.map((proyecto) => (
                    <button
                      key={proyecto.id_proyecto}
                      type="button"
                      className={`backlog-epica-item ${String(proyecto.id_proyecto) === String(selectedProyecto) ? "selected" : ""}`}
                      onClick={() => {
                        const nextProyecto = String(proyecto.id_proyecto);
                        setSelectedProyecto(nextProyecto);
                        setActiveProjectId(nextProyecto);
                        setSearchParams({ id_proyecto: nextProyecto }, { replace: true });
                        setProjectMenuOpen(false);
                      }}
                    >
                      <span className="backlog-epica-item-name">{proyecto.nombre}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="backlog-epica-all"
                  onClick={() => {
                    setProjectMenuOpen(false);
                    navigate(`/proyectos`);
                  }}
                >
                  Ver proyectos
                </button>
              </div>
            )}
          </div>

          <label htmlFor="epica-form-nombre">Nombre</label>
          <input
            className="editable-control"
            id="epica-form-nombre"
            value={form.nombre}
            onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
            disabled={!isEditing}
          />

          <label htmlFor="epica-form-descripcion">Descripcion</label>
          <textarea
            className="editable-control"
            id="epica-form-descripcion"
            value={form.descripcion}
            onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
            disabled={!isEditing}
          />

          <label htmlFor="epica-form-categoria">Categoria</label>
          <input
            className="editable-control"
            id="epica-form-categoria"
            value={form.categoria}
            onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}
            disabled={!isEditing}
          />

          <label htmlFor="epica-form-prioridad">Prioridad (1-5)</label>
          <input
            className="editable-control"
            id="epica-form-prioridad"
            type="number"
            min="1"
            max="5"
            value={form.prioridad}
            onChange={(event) => setForm((prev) => ({ ...prev, prioridad: event.target.value }))}
            disabled={!isEditing}
          />

          <label htmlFor="epica-form-estado">Estado</label>
          <select
            className="editable-control"
            id="epica-form-estado"
            value={form.estado}
            onChange={(event) => setForm((prev) => ({ ...prev, estado: event.target.value }))}
            disabled={!isEditing}
          >
            {ESTADOS_EPICA.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          <div className="epicas-form-buttons">
            <button
              type="submit"
              className="btn-main"
              disabled={!isEditing || saving || !selectedProyecto || !form.nombre.trim()}
            >
              {saving ? "Creando..." : "Crear epica"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
