import React from "react";
import "./VisualPrioritySelector.css";

const PRIORIDADES = [
  { valor: 1, label: "1 - Muy Baja (No urgente)" },
  { valor: 2, label: "2 - Baja" },
  { valor: 3, label: "3 - Media (Normal)" },
  { valor: 4, label: "4 - Alta (Importante)" },
  { valor: 5, label: "5 - Crítica (Bloqueante)" }
];

const DESCRIPCIONES = {
  historia: {
    1: "Ajustes estéticos, ideas a futuro o tareas que no aportan valor inmediato.",
    2: "Mejoras menores o errores pequeños que no afectan el uso normal de la aplicación.",
    3: "Nuevas funcionalidades o tareas estándar que aportan valor esperado al producto.",
    4: "Características clave, o errores graves que afectan a muchos usuarios pero tienen solución temporal.",
    5: "Pérdida de datos, el sistema está caído o errores que impiden por completo el uso de la app."
  },
  epica: {
    1: "Iniciativa a muy largo plazo o de bajo impacto comercial. Se hará si sobra tiempo.",
    2: "Proyecto secundario con impacto moderado. No es vital para los objetivos actuales.",
    3: "Iniciativa estándar. Aporta un valor claro y está alineada con los objetivos del equipo.",
    4: "Proyecto de alto impacto y estratégico para el negocio. Debería comenzarse pronto.",
    5: "Iniciativa crítica y urgente. El éxito del negocio o del producto depende de esto."
  }
};

export default function VisualPrioritySelector({ value, onChange, disabled, type = "historia" }) {
  const numValue = Number(value) || 3;
  const currentPrio = PRIORIDADES.find((p) => p.valor === numValue);

  return (
    <div className={`visual-priority-selector prio-lvl-${numValue} ${disabled ? "disabled" : ""}`}>
      <div className="priority-bars">
        {PRIORIDADES.map((p) => (
          <button
            key={p.valor}
            type="button"
            className={`priority-bar ${numValue >= p.valor ? "filled" : ""} ${numValue === p.valor ? "selected" : ""}`}
            onClick={() => !disabled && onChange(p.valor)}
            disabled={disabled}
            title={p.label}
            aria-label={p.label}
            aria-pressed={numValue === p.valor}
          />
        ))}
      </div>
      <div className="priority-label-display">
        {currentPrio ? currentPrio.label : "Selecciona prioridad"}
      </div>
      <div className="priority-desc-display">
        {currentPrio 
          ? DESCRIPCIONES[type][currentPrio.valor] 
          : "Haz clic en las barras para ver cuándo usar cada nivel."}
      </div>
    </div>
  );
}
