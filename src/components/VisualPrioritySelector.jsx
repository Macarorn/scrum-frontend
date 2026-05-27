import React from "react";
import "./VisualPrioritySelector.css";

const PRIORIDADES = [
  { valor: 1, label: "1 - Muy Baja (No urgente)" },
  { valor: 2, label: "2 - Baja" },
  { valor: 3, label: "3 - Media (Normal)" },
  { valor: 4, label: "4 - Alta (Importante)" },
  { valor: 5, label: "5 - Crítica (Bloqueante)" }
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
    </div>
  );
}
