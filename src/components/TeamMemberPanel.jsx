import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { listarMiembrosMetricas } from "../services/metricas-dashboard.service";

const emptyMember = {
  name: "Sin integrantes",
  role: "Integrante",
  initials: "SI",
  bg: "#7C4DFF",
  stories: 0,
  tasks: 0,
  completed: 0,
  inProgress: 0,
  pending: 0,
  compliance: 0,
  trend: [],
};

export function TeamMemberPanel({ members = [], projectId = "" }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const [memberOptions, setMemberOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      if (!projectId) {
        setMemberOptions([]);
        return;
      }

      try {
        const response = await listarMiembrosMetricas(projectId);
        if (!isMounted) return;
        const items = Array.isArray(response) ? response : [];
        setMemberOptions(items);
      } catch {
        if (isMounted) setMemberOptions([]);
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const normalizedMembers = useMemo(() => {
    const propMembers = Array.isArray(members) ? members : [];
    const apiMembers = Array.isArray(memberOptions) ? memberOptions : [];
    const merged = [...propMembers, ...apiMembers];
    const seen = new Set();

    return merged.reduce((acc, member) => {
      const key = `${member.id ?? member.id_usuario ?? member.email ?? member.nombre ?? member.name ?? ""}-${member.nombre ?? member.name ?? member.email ?? ""}-${member.rol ?? member.role ?? ""}`;
      if (seen.has(key)) return acc;
      seen.add(key);
      acc.push({
        ...member,
        name: member.name || member.nombre || "Sin nombre",
        role: member.role || member.rol || "Integrante",
        stories: member.stories ?? member.historiasAsignadas ?? member.historias ?? 0,
        tasks: member.tasks ?? member.tareasAsignadas ?? member.tareas ?? 0,
        completed: member.completed ?? member.tareasCompletadas ?? 0,
        inProgress: member.inProgress ?? member.tareasEnProgreso ?? 0,
        pending: member.pending ?? member.tareasPorHacer ?? 0,
        compliance: member.compliance ?? member.productividad ?? 0,
        trend: member.trend ?? [],
        initials: member.initials || (member.name || member.nombre || "SI").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
        bg: member.bg || "#7C4DFF",
      });
      return acc;
    }, []);
  }, [members, memberOptions]);

  const filtered = normalizedMembers.filter((m) => (m.name || "").toLowerCase().includes(search.toLowerCase()));
  const member = normalizedMembers[selected] || filtered[0] || emptyMember;

  return (
    <div
      style={{
        background: "#FDFCFF",
        border: "2px solid #E8D8FF",
        borderRadius: 16,
        padding: "18px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
        minHeight: 420,
      }}
    >
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#7C4DFF" }}>
        Seguimiento por Integrante
      </p>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search size={12} color="#C4B5FD" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }} />
        <input
          placeholder="Buscar integrante..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          style={{
            width: "100%", padding: "6px 8px 6px 26px",
            border: "1.5px solid #E8D8FF", borderRadius: 8,
            fontSize: 11.5, color: "#1F2937", background: "#ffffff",
            outline: "none", boxSizing: "border-box", fontFamily: "inherit",
          }}
        />
        <ChevronDown size={12} color="#C4B5FD" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }} />

        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "#ffffff",
              border: "1.5px solid #E8D8FF",
              borderRadius: 8,
              zIndex: 30,
              maxHeight: 168,
              overflowY: "auto",
              boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((m) => {
                const idx = normalizedMembers.findIndex((candidate) => candidate.name === m.name && candidate.role === m.role);
                return (
                  <button
                    key={`${m.name}-${m.role}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelected(idx >= 0 ? idx : 0);
                      setSearch(m.name);
                      setShowDropdown(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "8px 10px",
                      border: "none",
                      background: "#ffffff",
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                      {m.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#1F2937" }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: "#9CA3AF" }}>{m.role}</div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: "8px 10px", fontSize: 11, color: "#9CA3AF" }}>No hay integrantes para mostrar</div>
            )}
          </div>
        )}
      </div>

      {/* Member card */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: member.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {member.initials}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>{member.name}</div>
          <span style={{ background: "#F3EEFF", color: "#7C4DFF", fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 5 }}>
            {member.role}
          </span>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: 5 }}>
        {[
          { label: "Historias", value: member.stories, color: "#2F80ED", bg: "#EAF4FF" },
          { label: "Tareas", value: member.tasks, color: "#39A900", bg: "#EAF7E1" },
          { label: "Completadas", value: member.completed, color: "#39A900", bg: "#EAF7E1" },
          { label: "Pendientes", value: member.pending, color: "#E54861", bg: "#FFF0F3" },
          { label: "Progreso", value: `${member.compliance}%`, color: "#7C4DFF", bg: "#F3EEFF" },
        ].map((m) => (
          <div key={m.label} style={{ background: m.bg, borderRadius: 8, padding: "6px 4px", textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: 8.5, color: "#9CA3AF", marginTop: 1, lineHeight: 1.2 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Compliance */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#6B7280" }}>Participación</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#7C4DFF" }}>{member.compliance}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "#F3EEFF", overflow: "hidden" }}>
          <div style={{ width: `${member.compliance}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#7C4DFF,#A97DFF)", transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <p style={{ margin: 0, fontSize: 10, color: "#9CA3AF" }}>Rendimiento de las últimas 4 semanas</p>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <LineChart data={member.trend}>
              <XAxis dataKey="w" tick={{ fontSize: 8, fill: "#C4B5FD" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 6, border: "1px solid #E8D8FF", fontSize: 10 }} formatter={(v) => [`${v}%`, "Rendimiento"]} />
              <Line type="monotone" dataKey="v" stroke="#7C4DFF" strokeWidth={2} dot={{ r: 2.5, fill: "#7C4DFF", strokeWidth: 0 }} activeDot={{ r: 3.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
