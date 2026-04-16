import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { clearSessionTokens } from "../../services/auth.service";
import { crearTarea } from "../../services/sprint.service";
import "../../styles/Epicas.css";

const PRIORIDADES = ["baja", "media", "alta", "critica"];
const TIPOS = ["RF", "RNF", "bug", "mejora", "otro"];

export default function TareaNueva() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const historiaIdParam = searchParams.get("id_historia") || "";
  const historiaNombre = searchParams.get("historia_nombre") || "";
  const idProyecto = searchParams.get("id_proyecto") || "";

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_historia: historiaIdParam,
    prioridad: "media",
    tipo: "otro",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((prev) => ({ ...prev, id_historia: historiaIdParam }));
  }, [historiaIdParam]);

  const handleAuthError = () => {
    clearSessionTokens();
    navigate("/login", { replace: true });
  };

  const canSubmit = useMemo(() => {
    return form.nombre.trim() && Number(historiaIdParam) > 0;
  }, [form.nombre, historiaIdParam]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      await crearTarea({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        id_historia: Number(historiaIdParam),
        prioridad: form.prioridad,
        tipo: form.tipo,
      });

      navigate(idProyecto ? `/sprints?id_proyecto=${idProyecto}` : "/sprints");
    } catch (err) {
      if (err.code === "UNAUTHENTICATED") {
        handleAuthError();
        return;
      }

      setError(err.message || "No se pudo crear la tarea");
    } finally {
      setLoading(false);
    }
  };

  if (!historiaIdParam) {
    return (
      <section className="epicas-page">
        <header className="epicas-header">
          <div>
            <h1>Crear tarea</h1>
            <p>Abre una historia para crear su tarea</p>
          </div>
          <div className="epicas-form-buttons">
            <button type="button" className="btn-soft" onClick={() => navigate(-1)}>
              Volver
            </button>
            <button type="button" className="btn-main" onClick={() => navigate(idProyecto ? `/backlog?id_proyecto=${idProyecto}` : "/backlog")}>
              Ir al backlog
            </button>
          </div>
        </header>
      </section>
    );
  }

  return (
    <section className="epicas-page">
      <header className="epicas-header">
        <div>
          <h1>Crear tarea</h1>
          <p>
            {historiaIdParam
              ? `Asociada automaticamente a la historia #${historiaIdParam}${historiaNombre ? ` - ${historiaNombre}` : ""}`
              : "Asociada a una historia existente"}
          </p>
        </div>
        <div className="epicas-form-buttons">
          <button type="button" className="btn-soft" onClick={() => navigate(-1)}>
            Volver
          </button>
          <button type="button" className="btn-main" onClick={handleSubmit} disabled={loading || !canSubmit}>
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </header>

      {error && <p className="epicas-error">{error}</p>}
      <article className="epica-detail-card historia-main-card">
        <form className="historia-edit-layout" onSubmit={handleSubmit}>
          <div className="epica-detail-card historia-main-card">
            <div className="historia-meta-grid">
              <div>
                <label htmlFor="tarea-historia">ID de historia<span className="historia-required">*</span></label>
                <input
                  id="tarea-historia"
                  type="number"
                  value={historiaIdParam}
                  min="1"
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="tarea-prioridad">Prioridad</label>
                <select
                  id="tarea-prioridad"
                  value={form.prioridad}
                  onChange={(event) => setForm((prev) => ({ ...prev, prioridad: event.target.value }))}
                >
                  {PRIORIDADES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tarea-tipo">Tipo</label>
                <select
                  id="tarea-tipo"
                  value={form.tipo}
                  onChange={(event) => setForm((prev) => ({ ...prev, tipo: event.target.value }))}
                >
                  {TIPOS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="historia-field-block">
              <label htmlFor="tarea-nombre">Nombre de la tarea<span className="historia-required">*</span></label>
              <input
                id="tarea-nombre"
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                disabled={!historiaIdParam}
              />
            </div>

            <div className="historia-field-block historia-description-block">
              <label htmlFor="tarea-descripcion">Descripción</label>
              <textarea
                id="tarea-descripcion"
                value={form.descripcion}
                onChange={(event) => setForm((prev) => ({ ...prev, descripcion: event.target.value }))}
                placeholder="Describe el trabajo a realizar"
                disabled={!historiaIdParam}
              />
            </div>
          </div>
        </form>
      </article>
    </section>
  );
}