import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const defaultProgress = {
  percent: 0,
  completed: 0,
  pending: 0,
  total: 0,
  data: [{ value: 0 }, { value: 0 }],
};

const COLORS = ["#39A900", "#EAF7E1"];

export function ProjectProgressPanel({ progress, loading = false }) {
  const data = progress || defaultProgress;
  const chartData = data.data?.length ? data.data : defaultProgress.data;

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
        <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i] || COLORS[1]} />)}
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
            <span style={{ fontSize: 26, fontWeight: 800, color: "#39A900", lineHeight: 1 }}>
              {loading ? "..." : `${data.percent}%`}
            </span>
            <span style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Completado</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#1F2937" }}>
              Estado general del proyecto
            </p>
            <p style={{ margin: "5px 0 0", fontSize: 11.5, color: "#6B7280", lineHeight: 1.55 }}>
              El proyecto tiene un avance del {data.percent}% con {data.completed} tareas completadas de un total de {data.total} tareas planificadas.
            </p>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            {[
              { n: data.completed, label: "Completadas", c: "#39A900" },
              { n: data.pending, label: "Pendientes", c: "#FF8A26" },
              { n: data.total, label: "Total", c: "#2F80ED" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.c, lineHeight: 1 }}>{loading ? "..." : s.n}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
