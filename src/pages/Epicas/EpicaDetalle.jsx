import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../../styles/Epicas.css";
import { clearSessionTokens } from "../../services/auth.service";
import { editarEpica, obtenerEpica } from "../../services/epicas.service";
import { listarHistoriasPorEpica } from "../../services/historias.service";

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

  const idProyecto = searchParams.get("id_proyecto") || "";

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

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
        setError(err.message || "No se pudo cargar el detalle de la epica");
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
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }, 2600);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search, location.state, navigate]);

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
      setSuccess("Epica actualizada correctamente");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      setError(err.message || "No se pudo actualizar la epica");
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
        <Alert variant="danger" className="shadow-sm mb-3" dismissible onClose={() => setError("")}>
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
          <h1>Epicas</h1>
          <p>{epica.nombre}</p>
        </div>
        <div className="epicas-form-buttons">
          <button
            type="button"
            className="btn-soft"
            onClick={() => navigate(`/epicas?id_proyecto=${idProyecto}`)}
          >
            Volver
          </button>
          {!isEditing ? (
            <button type="button" className="btn-main" onClick={handleStartEdit}>
              Editar
            </button>
          ) : (
            <>
              <button type="button" className="btn-main" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button type="button" className="btn-soft" onClick={handleCancelEdit} disabled={saving}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </header>

      {success && (
        <Alert variant="success" className="shadow-sm mb-3" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <div className="epica-detail-layout">
        <article className="epica-detail-card">
          <div className="epica-detail-field">
            <strong>Nombre</strong>
            <input
              value={draft.nombre}
              onChange={(event) => setDraft((prev) => ({ ...prev, nombre: event.target.value }))}
              disabled={!isEditing}
            />
          </div>
          <div className="epica-detail-field">
            <strong>Descripcion</strong>
            <textarea
              value={draft.descripcion}
              onChange={(event) => setDraft((prev) => ({ ...prev, descripcion: event.target.value }))}
              disabled={!isEditing}
            />
          </div>
          <div className="epica-detail-field">
            <strong>Categoria</strong>
            <input
              value={draft.categoria}
              onChange={(event) => setDraft((prev) => ({ ...prev, categoria: event.target.value }))}
              disabled={!isEditing}
            />
          </div>
          <div className="epica-detail-field">
            <strong>Prioridad</strong>
            <input
              type="number"
              min="1"
              max="5"
              value={draft.prioridad}
              onChange={(event) => setDraft((prev) => ({ ...prev, prioridad: event.target.value }))}
              disabled={!isEditing}
            />
          </div>
          <div className="epica-detail-field">
            <strong>Estado</strong>
            <select
              value={draft.estado}
              onChange={(event) => setDraft((prev) => ({ ...prev, estado: event.target.value }))}
              disabled={!isEditing}
            >
              <option value="por_hacer">por_hacer</option>
              <option value="en_progreso">en_progreso</option>
              <option value="completada">completada</option>
              <option value="cancelada">cancelada</option>
            </select>
          </div>
        </article>

        <section className="epica-historias-card">
          <h3>Historias de usuario</h3>
          {historias.length === 0 ? (
            <p className="epicas-placeholder">No hay historias asociadas.</p>
          ) : (
            <div className="historias-list">
              {historias.map((historia) => (
                <button
                  key={historia.id}
                  type="button"
                  className="historia-item"
                  onClick={() =>
                    navigate(`/historias/${historia.id}?id_epica=${epica.id}&id_proyecto=${idProyecto}`)
                  }
                >
                  <span>{historia.nombre}</span>
                  <small>#{historia.id}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {toastMessage && (
        <div className="epica-toast" role="status" aria-live="polite">
          <div className="epica-toast-text">{toastMessage}</div>
          <span className="epica-toast-icon" aria-hidden="true">✓</span>
        </div>
      )}
    </section>
  );
}
