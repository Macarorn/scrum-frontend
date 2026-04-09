import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "../../styles/Epicas.css";
import { clearSessionTokens } from "../../services/auth.service";
import {
  editarHistoria,
  obtenerHistoria,
  toggleCriterioHistoria,
} from "../../services/historias.service";

const ESTADOS = ["por_hacer", "en_progreso", "terminado", "eliminado"];

export default function HistoriaDetalle() {
  const navigate = useNavigate();
  const { idHistoria } = useParams();
  const [searchParams] = useSearchParams();

  const [historia, setHistoria] = useState(null);
  const [draft, setDraft] = useState({
    nombre: "",
    descripcion: "",
    como_quien: "",
    quiero: "",
    para: "",
    prioridad: 3,
    story_points: "",
    estimacion_dias: "",
    estado: "por_hacer",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const idEpica = searchParams.get("id_epica") || "";
  const idProyecto = searchParams.get("id_proyecto") || "";

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const loadHistoria = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await obtenerHistoria(idHistoria);
        setHistoria(data);
        setDraft({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          como_quien: data.como_quien || "",
          quiero: data.quiero || "",
          para: data.para || "",
          prioridad: data.prioridad || 3,
          story_points: data.story_points ?? "",
          estimacion_dias: data.estimacion_dias ?? "",
          estado: data.estado || "por_hacer",
        });
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

    loadHistoria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idHistoria]);

  const handleSave = async () => {
    if (!historia?.id_historia || !draft.nombre.trim()) return;

    setSaving(true);
    setError("");
    try {
      const updated = await editarHistoria(historia.id_historia, {
        nombre: draft.nombre.trim(),
        descripcion: draft.descripcion.trim() || null,
        como_quien: draft.como_quien.trim() || null,
        quiero: draft.quiero.trim() || null,
        para: draft.para.trim() || null,
        prioridad: Number(draft.prioridad) || 3,
        story_points: draft.story_points === "" ? null : Number(draft.story_points),
        estimacion_dias: draft.estimacion_dias === "" ? null : Number(draft.estimacion_dias),
        estado: draft.estado,
      });
      setHistoria(updated);
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      setError(err.message || "No se pudo guardar la historia");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCriterio = async (idCriterio) => {
    if (!historia?.id_historia) return;

    try {
      const updatedCriterio = await toggleCriterioHistoria(historia.id_historia, idCriterio);
      setHistoria((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          criterios: (prev.criterios || []).map((crit) =>
            crit.id_criterio === updatedCriterio.id_criterio ? updatedCriterio : crit,
          ),
        };
      });
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }
      setError(err.message || "No se pudo actualizar criterio");
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
        <p className="epicas-error">{error}</p>
      </section>
    );
  }

  return (
    <section className="epicas-page">
      <header className="epicas-header">
        <div>
          <h1>Historia de Usuario</h1>
          <p>{historia?.epica_nombre || "Epica"}</p>
        </div>
        <div className="epicas-form-buttons">
          <button
            type="button"
            className="btn-soft"
            onClick={() => navigate(`/epicas/${idEpica}?id_proyecto=${idProyecto}`)}
          >
            Volver
          </button>
          <button
            type="button"
            className="btn-main"
            onClick={handleSave}
            disabled={saving || !draft.nombre.trim()}
          >
            {saving ? "Guardando..." : "Listo"}
          </button>
        </div>
      </header>

      {error && <p className="epicas-error">{error}</p>}

      <div className="historia-edit-layout">
        <article className="epica-detail-card">
          <h2>{draft.nombre}</h2>

          <label htmlFor="historia-nombre">Nombre</label>
          <input
            id="historia-nombre"
            value={draft.nombre}
            onChange={(event) => setDraft((prev) => ({ ...prev, nombre: event.target.value }))}
          />

          <label htmlFor="historia-prioridad">Prioridad</label>
          <input
            id="historia-prioridad"
            type="number"
            min="1"
            max="5"
            value={draft.prioridad}
            onChange={(event) => setDraft((prev) => ({ ...prev, prioridad: event.target.value }))}
          />

          <label htmlFor="historia-estado">Estado</label>
          <select
            id="historia-estado"
            value={draft.estado}
            onChange={(event) => setDraft((prev) => ({ ...prev, estado: event.target.value }))}
          >
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          <label htmlFor="historia-descripcion">Descripcion</label>
          <textarea
            id="historia-descripcion"
            value={draft.descripcion}
            onChange={(event) => setDraft((prev) => ({ ...prev, descripcion: event.target.value }))}
          />

          <label htmlFor="historia-como">Como</label>
          <input
            id="historia-como"
            value={draft.como_quien}
            onChange={(event) => setDraft((prev) => ({ ...prev, como_quien: event.target.value }))}
          />

          <label htmlFor="historia-quiero">Quiero</label>
          <input
            id="historia-quiero"
            value={draft.quiero}
            onChange={(event) => setDraft((prev) => ({ ...prev, quiero: event.target.value }))}
          />

          <label htmlFor="historia-para">Para</label>
          <input
            id="historia-para"
            value={draft.para}
            onChange={(event) => setDraft((prev) => ({ ...prev, para: event.target.value }))}
          />
        </article>

        <section className="epica-historias-card">
          <h3>Criterios de aceptacion</h3>
          {!historia?.criterios?.length ? (
            <p className="epicas-placeholder">No hay criterios para esta historia.</p>
          ) : (
            <ul className="criterios-list">
              {historia.criterios.map((criterio) => (
                <li key={criterio.id_criterio}>
                  <button
                    type="button"
                    className={`criterio-item ${criterio.cumplido ? "done" : ""}`}
                    onClick={() => handleToggleCriterio(criterio.id_criterio)}
                  >
                    {criterio.descripcion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
