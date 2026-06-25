import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const defaultEpicStatus = {
  total: 0,
  percent: 0,
  data: [
    { name: "Completadas", value: 0, color: "#7C4DFF" },
    { name: "Pendientes", value: 0, color: "#FF8A26" },
  ],
  epics: [],
};

export function EpicStatusPanel({ epicStatus, loading = false }) {
  const data = epicStatus || defaultEpicStatus;
  const chartData = data.data?.length ? data.data : defaultEpicStatus.data;
  const epics = data.epics?.length ? data.epics : [];

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
        Estado de las Epicas
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "center", flex: 1 }}>
        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={36} outerRadius={54} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                {chartData.map((item, i) => <Cell key={i} fill={item.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v} epicas`, n]} contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#7C4DFF", lineHeight: 1 }}>{loading ? "..." : `${data.percent}%`}</span>
            <span style={{ fontSize: 9, color: "#9CA3AF", marginTop: 1 }}>completado</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {chartData.map((item) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                <span style={{ fontSize: 11.5, color: "#6B7280" }}>{item.name}</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{loading ? "..." : item.value}</span>
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxHeight: 110, overflowY: "auto" }}>
            {epics.map((epic) => (
              <div
                key={epic.name}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 0", borderBottom: "1px solid #F9FAFB",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: epic.done ? "#7C4DFF" : "#FF8A26" }} />
                <span style={{ fontSize: 11, color: epic.done ? "#9CA3AF" : "#1F2937", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: epic.done ? "line-through" : "none" }}>
                  {epic.name}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: epic.done ? "#7C4DFF" : "#FF8A26", flexShrink: 0 }}>
                  {epic.done ? "100%" : "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#F3EEFF", borderRadius: 10, padding: "8px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 12, color: "#7C4DFF", fontWeight: 600 }}>Total de epicas:</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#7C4DFF" }}>{loading ? "..." : data.total}</span>
      </div>
    </div>
  );
}
