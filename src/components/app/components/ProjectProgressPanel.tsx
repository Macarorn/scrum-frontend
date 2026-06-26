import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { value: 74 },
  { value: 26 },
];
const COLORS = ["#39A900", "#EAF7E1"];

export function ProjectProgressPanel() {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
      }}
    >
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1F2937" }}>
        Progreso General del Proyecto
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1 }}>
        {/* Donut */}
        <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 800, color: "#39A900", lineHeight: 1 }}>74%</span>
            <span style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Completado</span>
          </div>
        </div>

        {/* Right */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1F2937" }}>
              Estado general del proyecto
            </p>
            <p style={{ margin: "5px 0 0", fontSize: 11.5, color: "#6B7280", lineHeight: 1.55 }}>
              El proyecto tiene un avance del 74% con 89 tareas completadas de un total de 120 tareas planificadas.
            </p>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            {[
              { n: "89", label: "Completadas", c: "#39A900" },
              { n: "31", label: "Pendientes", c: "#FF8A26" },
              { n: "120", label: "Total", c: "#2F80ED" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#EAF7E1",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#39A900",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              width: "fit-content",
            }}
          >
            ↗ +8% desde el último sprint
          </div>
        </div>
      </div>
    </div>
  );
}
