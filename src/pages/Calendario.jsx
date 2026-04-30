import { useEffect, useState, useMemo } from "react";
import "../assets/calendario.css";

const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function generateCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const weeks = [];
  let dayCounter = 1;
  let nextMonthDay = 1;

  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      const index = w * 7 + d;
      if (index < firstWeekday) {
        const day = daysInPrev - (firstWeekday - 1 - index);
        row.push({ day, other: true, date: new Date(year, month - 1, day) });
      } else if (dayCounter <= daysInMonth) {
        row.push({ day: dayCounter, other: false, date: new Date(year, month, dayCounter) });
        dayCounter++;
      } else {
        row.push({ day: nextMonthDay++, other: true, date: new Date(year, month + 1, nextMonthDay - 1) });
      }
    }
    weeks.push(row);
  }

  return weeks;
}

const isSameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [weeks, setWeeks] = useState(() => generateCalendar(new Date()));
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteTargetEvent, setDeleteTargetEvent] = useState(null);
  const [deleteNotice, setDeleteNotice] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [timeAlert, setTimeAlert] = useState(null);

  const [events, setEvents] = useState([
    {
      id: 1,
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 8),
      title: "Reunión de equipo",
      desc: "Revisión de avances del proyecto.",
      time: "10:00 a. m. - 11:30 a. m.",
      room: "Sala 2",
      modificationCount: 0,
    },
    {
      id: 2,
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
      title: "Presentación Cliente",
      desc: "Presentación de la nueva funcionalidad.",
      time: "02:00 p. m. - 03:00 p. m.",
      room: "Sala 1",
      modificationCount: 0,
    },
    {
      id: 3,
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
      title: "Planificación Sprint",
      desc: "Definir tareas para el próximo sprint.",
      time: "09:00 a. m. - 10:30 a. m.",
      room: "Sala 3",
      modificationCount: 0,
    },
  ]);

  const [form, setForm] = useState({ title: "", desc: "", date: "", time: "", room: "", link: "", startTime: "", endTime: "" });

  useEffect(() => {
    setWeeks(generateCalendar(currentDate));
  }, [currentDate]);

  // cerrar menú de opciones al hacer clic fuera
  useEffect(() => {
    const handleDocClick = () => setMenuOpenId(null);
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleAdd = () => {
    setEditingEventId(null);
    setForm({ title: "", desc: "", date: formatDateForInput(selectedDate || new Date()), time: "", room: "", link: "", startTime: "", endTime: "" });
    setShowModal(true);
  };

  const parseDateInput = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-").map((n) => Number(n));
    if (parts.length < 3) return new Date(dateStr);
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const saveEvent = () => {
    const dateParts = parseDateInput(form.date);
    // validar fecha mínima (no permitir fechas anteriores a hoy)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateParts < today) {
      setTimeAlert("No puedes seleccionar una fecha anterior a hoy.");
      return;
    }

    // construir y validar horario (si se usan start/end time)
    const timeStr = form.startTime && form.endTime ? `${form.startTime} - ${form.endTime}` : form.time || "";
    const isAfterMax = (t) => {
      if (!t) return false;
      const [h, m] = t.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return false;
      if (h > 20) return true;
      if (h === 20 && m > 0) return true;
      return false;
    };
    if (form.startTime && isAfterMax(form.startTime)) { setTimeAlert("Se pasa la hora de la reunión"); return; }
    if (form.endTime && isAfterMax(form.endTime)) { setTimeAlert("Se pasa la hora de la reunión"); return; }
    if (form.startTime && form.endTime) {
      const s = form.startTime.split(":").map(Number);
      const e = form.endTime.split(":").map(Number);
      const startMinutes = s[0] * 60 + s[1];
      const endMinutes = e[0] * 60 + e[1];
      if (endMinutes < startMinutes) { setTimeAlert("La hora de fin debe ser posterior a la hora de inicio."); return; }
    }
    if (editingEventId) {
      setEvents((list) =>
        list.map((ev) =>
          ev.id === editingEventId
            ? {
                ...ev,
                date: dateParts,
                title: form.title || ev.title,
                desc: form.desc || ev.desc,
                time: timeStr || ev.time,
                room: form.room || ev.room,
                link: form.link || ev.link || "",
                modificationCount: (ev.modificationCount || 0) + 1,
              }
            : ev
        )
      );
      setCurrentDate(new Date(dateParts.getFullYear(), dateParts.getMonth(), 1));
      setSelectedDate(dateParts);
      setEditingEventId(null);
      setShowModal(false);
      setForm({ title: "", desc: "", date: "", time: "", room: "", link: "", startTime: "", endTime: "" });
      return;
    }

    const newEvent = {
      id: Date.now(),
      date: dateParts,
      title: form.title || "Sin título",
      desc: form.desc || "",
      time: timeStr || "",
      room: form.room || "",
      link: form.link || "",
      modificationCount: 0,
    };
    setEvents((e) => [newEvent, ...e]);
    // show the month with the new event and select it so the dot appears immediately
    setCurrentDate(new Date(dateParts.getFullYear(), dateParts.getMonth(), 1));
    setSelectedDate(dateParts);
    setShowModal(false);
    setForm({ title: "", desc: "", date: "", time: "", room: "", link: "", startTime: "", endTime: "" });
  };

  const openEditModal = (ev) => {
    setEditingEventId(ev.id);
    // intentar extraer start/end time si el texto tiene formato HH:MM - HH:MM
    let startTime = "";
    let endTime = "";
    if (ev.time) {
      const m = String(ev.time).match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
      if (m) {
        startTime = m[1].padStart(5, "0");
        endTime = m[2].padStart(5, "0");
      }
    }
    setForm({
      title: ev.title || "",
      desc: ev.desc || "",
      date: formatDateForInput(ev.date),
      time: ev.time || "",
      room: ev.room || "",
      link: ev.link || "",
      startTime,
      endTime,
    });
    setShowModal(true);
  };

  const openDeleteConfirm = (id) => {
    setDeleteTarget(id);
    const ev = events.find((x) => x.id === id) || null;
    setDeleteTargetEvent(ev);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTarget == null) return;
    setEvents((e) => e.filter((x) => x.id !== deleteTarget));
    setDeleteTarget(null);
    setDeleteTargetEvent(null);
    setShowDeleteConfirm(false);
    setDeleteNotice("Reunión eliminada");
    setTimeout(() => setDeleteNotice(null), 3000);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setShowDeleteConfirm(false);
  };

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .slice()
      .sort((a, b) => a.date - b.date)
      .filter((e) => e.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  }, [events]);

  const eventColors = ["#4CB200", "#FFB74D", "#B388FF", "#4DB6AC"];

  const eventsOn = (date) => events.some((ev) => isSameDay(ev.date, date));

  return (
    <div className="detalles-container">
      <main className="main-content">
        <div className="calendar-top header-top">
          <div className="header-left">
            <h1 className="page-title">Centro de Reuniones</h1>
            <p className="subtitle muted">Aquí tienes tu agenda y próximas reuniones.</p>
          </div>

            <div className="header-right">
            <div className="search-box">
              <i className="bx bx-search"></i>
              <input placeholder="Buscar reuniones, proyectos..." />
            </div>

            <button className="notif-btn" aria-label="Notificaciones">
              <i className="bx bx-bell"></i>
              <span className="notif-count">3</span>
            </button>
            <div className="profile-box" role="button" tabIndex={0} aria-label="Perfil">
              <i className="bx bx-chevron-down"></i>
            </div>
          </div>
        </div>

        <div className="calendar-layout">
          <div className="calendar-box">
            <h1 className="calendar-title">Centro de Reuniones</h1>
            <div className="calendar-header">
              <div className="calendar-nav">
                <i className="bx bx-chevron-left" onClick={prevMonth} aria-hidden="true"></i>
                <i className="bx bx-calendar" id="calendar-picker-btn" onClick={() => setShowPicker((s) => !s)} aria-hidden="true"></i>
                <i className="bx bx-chevron-right" onClick={nextMonth} aria-hidden="true"></i>
                <span id="calendar-current-title" className="calendar-current-title">
                  {currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" })}
                </span>
              </div>

              <div className="calendar-actions">
                <button className="btn btn-light small-btn" onClick={() => setCurrentDate(new Date())}>Hoy</button>
              </div>

              {showPicker && (
                <div id="calendar-picker" className="calendar-picker-hidden" style={{ display: "block" }}>
                  <select id="calendar-month" value={currentDate.getMonth()} onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), Number(e.target.value), 1))}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <option key={i} value={i}>
                        {new Date(0, i).toLocaleString("es-ES", { month: "long" })}
                      </option>
                    ))}
                  </select>
                  <select id="calendar-year" value={currentDate.getFullYear()} onChange={(e) => setCurrentDate(new Date(Number(e.target.value), currentDate.getMonth(), 1))}>
                    {Array.from({ length: 11 }).map((_, i) => {
                      const y = new Date().getFullYear() - 5 + i;
                      return (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            <table className="calendar-table">
              <thead>
                <tr>
                  {weekdayLabels.map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody id="calendar-body">
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((cell, ci) => {
                      const hasEvents = eventsOn(cell.date);
                      return (
                        <td
                          key={ci}
                          onClick={() => {
                            if (cell.other) {
                              // navigate to the month of the clicked cell but don't mark it selected
                              setCurrentDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                              return;
                            }
                            setSelectedDate(cell.date);
                          }}
                          className={`${cell.other ? "calendar-other" : ""} ${isSameDay(cell.date, new Date()) ? "calendar-today" : ""} ${isSameDay(cell.date, selectedDate) ? "calendar-selected" : ""}`}
                        >
                          <div className="cell-inner">
                            <span className="cell-day">{cell.day}</span>
                            {hasEvents && <span className="calendar-dot" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="calendar-summary">
              <div className="summary-left">
                <div className="summary-icon"><i className="bx bx-calendar"></i></div>
                <div>
                  <div className="summary-title">{selectedDate.toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                  <div className="summary-sub">Tienes {events.filter((ev) => isSameDay(ev.date, selectedDate)).length} reuniones programadas</div>
                </div>
              </div>
              <div className="summary-action">
                <button className="btn btn-outline-green">Ver agenda del día</button>
              </div>
            </div>
          </div>

          <div className="calendar-events">
            <div className="events-header">
              <h2>Próximas Reuniones</h2>
              <button className="btn add-event-btn" id="add-event-btn" onClick={handleAdd}>
                <i className="bx bx-plus"></i> Agregar reunión
              </button>
            </div>

            <div id="event-list">
              {upcoming.map((ev, idx) => {
                const color = eventColors[idx % eventColors.length];
                const bg = `${color}20`; // light background
                return (
                        <div className="event-card" key={ev.id}>
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
                    {menuOpenId === ev.id && (
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
                    <div className="event-badge" style={{ background: bg, borderRadius: 12 }}>
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
                          <div className="event-desc">{ev.desc}</div>
                        </div>
                        {/* acciones movidas al menú de tres puntos */}
                      </div>

                      <div className="event-meta">
                        <span className="meta-item"><i className="bx bx-time-five"></i> {ev.time}</span>
                        <span className="meta-item"><i className="bx bx-map"></i> {ev.room}
                          {ev.modificationCount > 0 && <span className="mod-badge">Modificación {ev.modificationCount}</span>}
                        </span>
                        {ev.link && (
                          <span
                            className="meta-item link-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              try { window.open(ev.link, "_blank"); } catch (err) {}
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
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="events-footer">
              <div className="footer-card">
                <div className="footer-left"><i className="bx bx-calendar-alt"></i></div>
                <div className="footer-right">
                  <div className="footer-title">Total de reuniones esta semana</div>
                  <div className="footer-sub">{events.length} reuniones programadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div id="modal-reunion">
          <div className="modal-reunion-content">
            <h3>Agregar Reunión</h3>
            <label>Título:</label>
            <input type="text" id="reunion-titulo" placeholder="Título de la reunión" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <label>Descripción:</label>
            <textarea id="reunion-desc" placeholder="Descripción" value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} />
                  <label>Fecha:</label>
                  <input
                    type="date"
                    value={form.date}
                    min={formatDateForInput(new Date())}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />

                  <label>Hora inicio (opcional):</label>
                  <input
                    type="time"
                    max="20:00"
                    value={form.startTime || ""}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  />

                  <label>Hora fin (opcional):</label>
                  <input
                    type="time"
                    max="20:00"
                    value={form.endTime || ""}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  />

                  <label>Sala (opcional):</label>
                  <input type="text" value={form.room || ""} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="Sala 1" />

                  <label>Link (opcional):</label>
                  <input type="url" value={form.link || ""} placeholder="https://..." onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
            <div className="modal-reunion-actions">
              <button id="guardar-reunion" className="btn" onClick={saveEvent} style={{ background: "var(--menu-green)", color: "#fff" }}>
                Guardar
              </button>
              <button id="cerrar-modal-reunion" className="btn btn-light" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 22,
              width: 480,
              maxWidth: "92%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              ¿Está seguro que desea eliminar la reunión?
            </div>
            <div style={{ color: "#6c757d", marginBottom: 16 }}>
              <strong>{deleteTargetEvent?.title || "seleccionada"}</strong>
              {deleteTargetEvent && (
                <div style={{ color: "#6c757d", marginTop: 6 }}>
                  {deleteTargetEvent.date instanceof Date
                    ? deleteTargetEvent.date.toLocaleString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }) + (deleteTargetEvent.time ? " · " + deleteTargetEvent.time : "")
                    : ""}
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <button className="btn btn-light" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="btn" onClick={confirmDelete} style={{ backgroundColor: "#2e7d32", color: "white" }}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {timeAlert && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 1200,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 22,
              width: 420,
              maxWidth: "92%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{timeAlert}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <button className="btn" onClick={() => setTimeAlert(null)} style={{ backgroundColor: "#2e7d32", color: "white" }}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteNotice && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1400 }}>
          <div style={{ background: '#e6f7ee', color: '#0b6623', padding: '8px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
            {deleteNotice}
          </div>
        </div>
      )}
    </div>
  );
}
