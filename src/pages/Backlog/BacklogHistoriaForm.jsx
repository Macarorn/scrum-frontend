import React from 'react';

export default function BacklogHistoriaForm({
  formOpen,
  closeForm,
  editingHistoriaId,
  isEditingHistoria,
  form,
  setForm,
  handleSubmit,
  saving,
  startEditHistoria,
  cancelEditHistoria,
  PRIORIDADES
}) {
  if (!formOpen) return null;

  return (
    <div className="backlog-modal-backdrop" onClick={closeForm}>
      <div
        className="backlog-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="backlog-modal-header">
          <h2>
            {editingHistoriaId ? "Editar historia" : "Nueva historia"}
          </h2>
        </div>

        <form className="backlog-form" onSubmit={handleSubmit}>
          <label htmlFor="historia-nombre">Nombre</label>
          <input
            id="historia-nombre"
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            disabled={editingHistoriaId ? !isEditingHistoria : false}
          />

          <label htmlFor="historia-descripcion">Descripcion</label>
          <textarea
            id="historia-descripcion"
            value={form.descripcion}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                descripcion: event.target.value,
              }))
            }
            disabled={editingHistoriaId ? !isEditingHistoria : false}
          />

          <div className="backlog-form-grid">
            <div>
              <label htmlFor="historia-prioridad">Prioridad</label>
              <select
                id="historia-prioridad"
                value={form.prioridad}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    prioridad: event.target.value,
                  }))
                }
                disabled={editingHistoriaId ? !isEditingHistoria : false}
              >
                {PRIORIDADES.map((value) => (
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
                value={form.storyPoints}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    storyPoints: event.target.value,
                  }))
                }
                disabled={editingHistoriaId ? !isEditingHistoria : false}
              />
            </div>
          </div>

          {!editingHistoriaId && (
            <div className="backlog-form-actions">
              <button
                type="submit"
                className="btn-main"
                disabled={saving || !form.nombre.trim()}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          )}
          {editingHistoriaId && (
            <div className="backlog-edit-actions">
              {!isEditingHistoria ? (
                <button
                  type="button"
                  className="btn-main"
                  onClick={startEditHistoria}
                >
                  Editar
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="btn-main"
                    disabled={saving || !form.nombre.trim()}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    className="btn-soft"
                    onClick={cancelEditHistoria}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
