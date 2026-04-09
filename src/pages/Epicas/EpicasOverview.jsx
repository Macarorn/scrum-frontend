import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/Epicas.css";
import { clearSessionTokens } from "../../services/auth.service";
import {
  crearEpica,
  editarEpica,
  eliminarEpica,
  listarEpicasPorProyecto,
} from "../../services/epicas.service";
import { listarProyectos } from "../../services/proyectos.service";

const ESTADOS_EPICA = ["por_hacer", "en_progreso", "completada", "cancelada"];

export default function EpicasOverview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [proyectos, setProyectos] = useState([]);
  const [epicas, setEpicas] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(searchParams.get("id_proyecto") || "");

  const [loading, setLoading] = useState(true);
  const [loadingEpicas, setLoadingEpicas] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingEpicaId, setEditingEpicaId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    prioridad: 3,
    estado: "por_hacer",
  });

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  const syncQuery = (idProyecto) => {
    if (idProyecto) {
      setSearchParams({ id_proyecto: idProyecto }, { replace: true });
      return;
    }

    setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await listarProyectos();
        const items = response.data || [];
        setProyectos(items);

        if (items.length === 0) {
          setSelectedProyecto("");
          return;
        }

        const exists = items.some((p) => String(p.id_proyecto) === String(selectedProyecto));
        const firstId = exists ? selectedProyecto : String(items[0].id_proyecto);
        setSelectedProyecto(firstId);
        syncQuery(firstId);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar los proyectos");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedProyecto) {
      setEpicas([]);
      return;
    }

    const loadEpicas = async () => {
      setLoadingEpicas(true);
      setError("");

      try {
        const data = (await listarEpicasPorProyecto(selectedProyecto)) || [];
        setEpicas(data);
      } catch (err) {
        if (err.code === "UNAUTHENTICATED") {
          handleAuthError();
          return;
        }

        setError(err.message || "No se pudieron cargar las epicas");
      } finally {
        setLoadingEpicas(false);
      }
    };

    loadEpicas();
    syncQuery(selectedProyecto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProyecto]);

  const projectName = useMemo(() => {
    const selected = proyectos.find((p) => String(p.id_proyecto) === String(selectedProyecto));
    return selected?.nombre || "";
  }, [proyectos, selectedProyecto]);

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      categoria: "",
      prioridad: 3,
      estado: "por_hacer",
    });
    setEditingEpicaId(null);
  };

  const handleCreateOrEdit = async () => {
    if (!selectedProyecto || !form.nombre.trim()) return;

    setSaving(true);
    setError("");
    try {
      const payload = {
        id_proyecto: Number(selectedProyecto),
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria.trim() || null,
        prioridad: Number(form.prioridad) || 3,
        estado: form.estado,
      };

      const result = editingEpicaId
        ? await editarEpica(editingEpicaId, payload)
        : await crearEpica(payload);

      if (!editingEpicaId) {
        navigate(`/epicas/${result.id_epica}?id_proyecto=${selectedProyecto}`, {
          state: { toastMessage: "Creacion de Epica Exitosa" },
        });
        resetForm();
        return;
      }

      setEpicas((prev) => {
        if (editingEpicaId) {
          return prev.map((item) => (item.id_epica === result.id_epica ? result : item));
        }

        return [result, ...prev];
      });
      resetForm();
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      setError(err.message || "No se pudo guardar la epica");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (epica) => {
    setOpenMenuId(null);
    setEditingEpicaId(epica.id_epica);
    setForm({
      nombre: epica.nombre || "",
      descripcion: epica.descripcion || "",
      categoria: epica.categoria || "",
      prioridad: epica.prioridad || 3,
      estado: epica.estado || "por_hacer",
    });
  };

  const handleDelete = async (epica) => {
    setOpenMenuId(null);
    const confirmDelete = window.confirm(`Quieres borrar la epica \"${epica.nombre}\"?`);
    if (!confirmDelete) return;

    try {
      await eliminarEpica(epica.id_epica);
      setEpicas((prev) => prev.filter((item) => item.id_epica !== epica.id_epica));
      if (editingEpicaId === epica.id_epica) {
        resetForm();
      }
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      setError(err.message || "No se pudo borrar la epica");
    }
  };

  return (
    <section className="epicas-page">
      <header className="epicas-header">
        <div>
          <h1>Creacion de Epicas</h1>
          {projectName && <p>{projectName}</p>}
        </div>
        <div className="epicas-header-actions">
          <label htmlFor="proyectoEpicaSelect">Proyecto</label>
          <select
            id="proyectoEpicaSelect"
            value={selectedProyecto}
            onChange={(event) => setSelectedProyecto(event.target.value)}
            disabled={loading || proyectos.length === 0}
          >
            {proyectos.length === 0 && <option value="">Sin proyectos</option>}
            {proyectos.map((proyecto) => (
              <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && <p className="epicas-error">{error}</p>}

      <div className="epicas-layout">
        <aside className="epicas-form-card">
          <h2>{editingEpicaId ? "Editar epica" : "Nueva epica"}</h2>

          <label htmlFor="epica-nombre">Nombre</label>
          <input
            id="epica-nombre"
            value={form.nombre}
            onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
          />

          <label htmlFor="epica-descripcion">Descripcion</label>
          <textarea
            id="epica-descripcion"
            value={form.descripcion}
            onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
          />

          <label htmlFor="epica-categoria">Categoria</label>
          <input
            id="epica-categoria"
            value={form.categoria}
            onChange={(event) => setForm((prev) => ({ ...prev, categoria: event.target.value }))}
          />

          <label htmlFor="epica-prioridad">Prioridad (1-5)</label>
          <input
            id="epica-prioridad"
            type="number"
            min="1"
            max="5"
            value={form.prioridad}
            onChange={(event) => setForm((prev) => ({ ...prev, prioridad: event.target.value }))}
          />

          <label htmlFor="epica-estado">Estado</label>
          <select
            id="epica-estado"
            value={form.estado}
            onChange={(event) => setForm((prev) => ({ ...prev, estado: event.target.value }))}
          >
            {ESTADOS_EPICA.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          <div className="epicas-form-buttons">
            {editingEpicaId && (
              <button type="button" className="btn-soft" onClick={resetForm}>
                Cancelar
              </button>
            )}
            <button
              type="button"
              className="btn-main"
              onClick={handleCreateOrEdit}
              disabled={saving || !selectedProyecto || !form.nombre.trim()}
            >
              {saving ? "Guardando..." : editingEpicaId ? "Guardar cambios" : "Crear epica"}
            </button>
          </div>
        </aside>

        <section className="epicas-grid-wrap">
          {loadingEpicas ? (
            <p className="epicas-placeholder">Cargando epicas...</p>
          ) : epicas.length === 0 ? (
            <p className="epicas-placeholder">No hay epicas para este proyecto.</p>
          ) : (
            <div className="epicas-grid">
              {epicas.map((epica) => (
                <article key={epica.id_epica} className="epica-card">
                  <button
                    type="button"
                    className="epica-card-title"
                    onClick={() => navigate(`/epicas/${epica.id_epica}?id_proyecto=${selectedProyecto}`)}
                  >
                    {epica.nombre}
                  </button>

                  <div className="epica-meta">H. Usuario {epica.total_historias || 0}</div>

                  <div className="epica-card-bottom">
                    <span className={`epica-status status-${epica.estado || "por_hacer"}`}>
                      {epica.estado || "por_hacer"}
                    </span>
                    <div className="epica-menu-wrap">
                      <button
                        type="button"
                        className="epica-menu-trigger"
                        onClick={() => setOpenMenuId((prev) => (prev === epica.id_epica ? null : epica.id_epica))}
                      >
                        ...
                      </button>
                      {openMenuId === epica.id_epica && (
                        <div className="epica-menu">
                          <button type="button" onClick={() => startEdit(epica)}>Editar</button>
                          <button type="button" className="danger" onClick={() => handleDelete(epica)}>
                            Borrar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
