import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SprintAccordion({
  sprintKey,
  meetings,
  eventColors,
  selectedDate,
  animateAgenda,
  getEventStatusClass,
  getPriorityClass,
  getEventStatusLabel,
  getPriorityLabel,
  isSameDay,
  setProjectDetail,
  setMeetingDetail,
  openDeleteConfirm,
  openEditModal,
  menuOpenId,
  setMenuOpenId,
}) {
  const [open, setOpen] = useState(sprintKey === "Sprint 1" || sprintKey === "Sprint 2");

  useEffect(() => {
    if (animateAgenda && selectedDate) {
      const hasMeetingOnSelectedDay = meetings.some((ev) => isSameDay(ev.date, selectedDate));
      if (hasMeetingOnSelectedDay) {
        setOpen(true);
        setTimeout(() => {
          const activeCard = document.querySelector(".agenda-animate");
          if (activeCard) {
            activeCard.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 150);
      }
    }
  }, [animateAgenda, selectedDate, meetings, isSameDay]);

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12, cursor: "pointer" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div style={{ fontWeight: 700, color: "#21402c", fontSize: "1.03rem", display: "flex", alignItems: "center", gap: 8 }}>
          <i className={`bx bx-chevron-${open ? "down" : "right"}`} style={{ fontSize: 20, color: "#39a900" }}></i>
          {sprintKey}
        </div>
        {!open && (
          <div style={{ color: "#4c8f38", fontSize: "0.93rem", fontWeight: 700 }}>
            {meetings.length} evento{meetings.length === 1 ? "" : "s"}
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {meetings.map((ev, idx) => {
              const color = eventColors[idx % eventColors.length];
              const bg = `${color}20`;
              const statusBadge = getEventStatusLabel(ev);
              return (
                <motion.div
                  layout
                  key={ev.id}
                  className={`event-card ${getEventStatusClass(ev)} ${getPriorityClass(ev.prioridad)} ${ev.source === "project" ? "project-event-card" : ""} ${animateAgenda && isSameDay(ev.date, selectedDate) ? "agenda-animate" : ""}`}
                  whileHover={{ scale: 1.015, boxShadow: "0 8px 32px #39a90022, 0 2px 12px rgba(0,0,0,0.09)" }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  onClick={() => {
                    if (ev.source === "project") {
                      setProjectDetail(ev.project);
                    } else {
                      setMeetingDetail(ev);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (ev.source === "project") {
                        setProjectDetail(ev.project);
                      } else {
                        setMeetingDetail(ev);
                      }
                    }
                  }}
                >
                  {ev.source !== "project" && ev.canManage !== false && (
                    <button
                      className="more-btn"
                      title="Más opciones"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId((prev) => (prev === ev.id ? null : ev.id));
                      }}
                      aria-haspopup="true"
                      aria-expanded={menuOpenId === ev.id}
                    >
                      <i className="bx bx-dots-vertical"></i>
                    </button>
                  )}
                  {ev.source !== "project" && ev.canManage !== false && menuOpenId === ev.id && (
                    <div
                      className="more-menu"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        className="more-menu-item more-menu-delete"
                        onClick={() => {
                          openDeleteConfirm(ev.id);
                          setMenuOpenId(null);
                        }}
                      >
                        × Eliminar
                      </button>
                      <button
                        className="more-menu-item"
                        onClick={() => {
                          openEditModal(ev);
                          setMenuOpenId(null);
                        }}
                      >
                        <i className="bx bx-pencil"></i> Editar
                      </button>
                    </div>
                  )}
                  <div className="event-badge">
                    <div className="badge-day" style={{ color }}>
                      {String(ev.date.getDate()).padStart(2, "0")}
                    </div>
                    <div className="badge-month" style={{ color }}>
                      {ev.date.toLocaleString("es-ES", { month: "short" }).replace(".", "").toUpperCase().slice(0, 3)}
                    </div>
                  </div>
                  <div className="event-info">
                    <div className="event-row">
                      <div>
                        <div className="event-title">{ev.title}</div>
                        {ev.projectName && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase" }}>
                            Proyecto: {ev.projectName}
                          </div>
                        )}
                        <div className="event-status-line">
                          <span className={`event-priority-badge ${getPriorityClass(ev.prioridad)}`}>
                            Prioridad {getPriorityLabel(ev.prioridad)}
                          </span>
                          {ev.source === "project" && <span className="project-event-chip">{ev.meetingType} de proyecto</span>}
                          {statusBadge && !ev.esHoy && (
                            <span className={`event-status-badge ${statusBadge.className}`}>
                              <i className={statusBadge.icon}></i>
                              {statusBadge.label}
                            </span>
                          )}
                          {Number.isFinite(ev.diasRestantes) && !ev.esHoy && (
                            <span className="event-days-badge">
                              {ev.diasRestantes > 0 ? `${ev.diasRestantes} dias` : `Hace ${Math.abs(ev.diasRestantes)} dias`}
                            </span>
                          )}
                        </div>
                        <div className="event-desc">{ev.desc.length > 50 ? ev.desc.substring(0, 50) + "..." : ev.desc}</div>
                      </div>
                    </div>
                    {(ev.source !== "project" || ev.link) && (
                      <div className="event-meta">
                        {ev.source !== "project" && (
                          <>
                            <span className="meta-item"><i className="bx bx-time-five"></i> {ev.time || ev.meetingType}</span>
                            <span className="meta-item"><i className="bx bx-map"></i> {ev.room || ev.sprintStatus}
                              {ev.modificationCount > 0 && <span className="mod-badge">Modificación {ev.modificationCount}</span>}
                            </span>
                            <span className="meta-item"><i className="bx bx-git-branch"></i> {ev.sprint || "Sin sprint"}</span>
                            <span className="meta-item"><i className="bx bx-time"></i> {ev.duration ? `${ev.duration} min` : ev.sprintStatus || "Sin estado"}</span>
                            {ev.responsible && ev.responsible !== "Equipo Scrum" && (
                              <span className="meta-item"><i className="bx bx-user-circle"></i> {ev.responsible}</span>
                            )}
                          </>
                        )}
                        {ev.link && (
                          <span
                            className="meta-item link-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              try { window.open(ev.link, "_blank"); } catch (error) {
                                console.warn("No se pudo abrir el enlace", error);
                              }
                            }}
                            role="link"
                            tabIndex={0}
                          >
                            <img
                              src={`https://www.google.com/s2/favicons?sz=64&domain_url=${ev.link}`}
                              alt="favicon"
                              className="event-link-favicon"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <span className="link-text">Abrir</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}