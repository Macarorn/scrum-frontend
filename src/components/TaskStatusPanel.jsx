import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const defaultData = [
  { name: "Por hacer", value: 0, color: "#2F80ED" },
  { name: "En progreso", value: 0, color: "#FF8A26" },
  { name: "Terminadas", value: 0, color: "#39A900" },
  { name: "Bloqueadas", value: 0, color: "#E54861" },
];

export function TaskStatusPanel({ data = {} }) {
  const {
    total = 0,
    data: chartData = defaultData,
  } = data;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "18px 18px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
      }}
    >
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1F2937" }}>
        Estado de las Tareas
      </p>

      {/* Donut */}
      <div style={{ position: "relative", height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip
              formatter={(v, n) => [`${v} tareas`, n]}
              contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11 }}
            />
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
          <span style={{ fontSize: 18, fontWeight: 800, color: "#1F2937", lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 10, color: "#9CA3AF" }}>Total</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {chartData.map((item) => (
          <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: "#6B7280" }}>{item.name}</span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Total box */}
      <div
        style={{
          background: "#EAF4FF",
          borderRadius: 10,
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, color: "#2F80ED", fontWeight: 600 }}>Total de tareas:</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#2F80ED" }}>{total}</span>
      </div>
    </div>
  );
}
