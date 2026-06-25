import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const defaultBacklog = {
  total: 0,
  completed: 0,
  pending: 0,
  percent: 0,
  donutData: [
    { value: 0, color: "#39A900" },
    { value: 0, color: "#EAF7E1" },
  ],
};

export function BacklogPanel({ backlog, loading = false }) {
  const data = backlog || defaultBacklog;
  const donutData = data.donutData?.length ? data.donutData : defaultBacklog.donutData;

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
        Avance del Backlog
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            { label: "Total", value: data.total, color: "#1F2937", bg: "#F9FAFB" },
            { label: "Completados", value: data.completed, color: "#39A900", bg: "#EAF7E1" },
            { label: "Pendientes", value: data.pending, color: "#FF8A26", bg: "#FFF3E8" },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: r.bg, borderRadius: 10, padding: "8px 14px",
              }}
            >
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{r.label}</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: r.color }}>{loading ? "..." : r.value}</span>
            </div>
          ))}
        </div>

        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={36} outerRadius={54} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                {donutData.map((item, i) => <Cell key={i} fill={item.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#39A900", lineHeight: 1 }}>{loading ? "..." : `${data.percent}%`}</span>
            <span style={{ fontSize: 9, color: "#6B7280", marginTop: 1 }}>completado</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{data.completed} de {data.total} elementos completados</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#39A900" }}>{data.percent}%</span>
        </div>
        <div style={{ height: 7, borderRadius: 999, background: "#EAF7E1", overflow: "hidden" }}>
          <div style={{ width: `${data.percent}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#39A900,#5DC800)" }} />
        </div>
      </div>
    </div>
  );
}
