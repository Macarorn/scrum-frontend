import React from "react";
import "./VisualPrioritySelector.css";

const PRIORIDADES = [
  { valor: 1, label: "1 - Muy Baja (No urgente)", desc: "Ajustes estéticos, ideas a futuro o tareas que no aportan valor inmediato." },
  { valor: 2, label: "2 - Baja", desc: "Mejoras menores o errores pequeños que no afectan el uso normal de la aplicación." },
  { valor: 3, label: "3 - Media (Normal)", desc: "Nuevas funcionalidades o tareas estándar que aportan valor esperado al producto." },
  { valor: 4, label: "4 - Alta (Importante)", desc: "Características clave, o errores graves que afectan a muchos usuarios pero tienen solución temporal." },
  { valor: 5, label: "5 - Crítica (Bloqueante)", desc: "Pérdida de datos, el sistema está caído o errores que impiden por completo el uso de la app." }
];

export default function VisualPrioritySelector({ value, onChange, disabled }) {
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
        {currentPrio ? currentPrio.desc : "Haz clic en las barras para ver cuándo usar cada nivel."}
      </div>
    </div>
  );
}
