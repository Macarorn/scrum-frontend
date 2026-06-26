import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const defaultStories = {
  total: 0,
  completed: 0,
  inProgress: 0,
  pending: 0,
  percent: 0,
};

const COLORS = ["#39A900", "#FF8A26", "#EAF7E1"];

export function StoriesPanel({ stories = {}, loading = false }) {
  const data = stories || defaultStories;
  const total = Number(data.total ?? data.total_historias ?? 0);
  const completed = Number(data.completed ?? data.terminado ?? data.completadas ?? 0);
  const inProgress = Number(data.inProgress ?? data.en_progreso ?? 0);
  const pending = Math.max(total - completed - inProgress, 0);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const chartData = [
    { name: "Completadas", value: completed, color: COLORS[0] },
    { name: "En progreso", value: inProgress, color: COLORS[1] },
    { name: "Pendientes", value: pending, color: COLORS[2] },
  ];

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "18px 20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
      }}
    >
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1F2937" }}>
        Historias del Proyecto
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Total", value: total, color: "#1F2937", bg: "#F9FAFB" },
            { label: "Completadas", value: completed, color: "#39A900", bg: "#EAF7E1" },
            { label: "En progreso", value: inProgress, color: "#FF8A26", bg: "#FFF3E8" },
            { label: "Pendientes", value: pending, color: "#E54861", bg: "#FFF0F3" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: item.bg,
                borderRadius: 10,
                padding: "8px 14px",
              }}
            >
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: item.color }}>{loading ? "..." : item.value}</span>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={54}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((item, index) => (
                  <Cell key={`${item.name}-${index}`} fill={item.color} />
                ))}
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
            <span style={{ fontSize: 20, fontWeight: 800, color: "#39A900", lineHeight: 1 }}>
              {loading ? "..." : `${percent}%`}
            </span>
            <span style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>completado</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>
            {completed} de {total} historias completadas
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#39A900" }}>{loading ? "..." : `${percent}%`}</span>
        </div>
        <div style={{ height: 7, borderRadius: 999, background: "#EAF7E1", overflow: "hidden" }}>
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg,#39A900,#5DC800)",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {chartData.map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: "#6B7280" }}>{item.name}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{loading ? "..." : item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
