import { useEffect, useState, useMemo } from "react";
import { listarMeetings, crearMeeting, actualizarMeeting, eliminarMeeting } from "../services/meetings.service";
import { listarProyectos } from "../services/proyectos.service";
import SprintAccordion from "./SprintAccordion";
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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const startOfDay = (value = new Date()) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizePriority = (value, fallback = "media") => {
  const priority = String(value || fallback).toLowerCase();
  if (["alta", "media", "baja"].includes(priority)) return priority;
  if (priority === "critica") return "alta";
  return fallback;
};

const getEventDateMetadata = (date, priority) => {
  const eventDate = startOfDay(date);
  const today = startOfDay();
  const diasRestantes = Math.round((eventDate - today) / DAY_IN_MS);
  const esHoy = diasRestantes === 0;
  const proximoEvento = diasRestantes > 0 && diasRestantes <= 3;
  const atrasado = diasRestantes < 0;

  return {
    esHoy,
    proximoEvento,
    atrasado,
    diasRestantes,
    prioridad: normalizePriority(priority, esHoy || atrasado ? "alta" : proximoEvento ? "media" : "baja"),
  };
};

const getEventStatusClass = (event) => {
  if (event.esHoy) return "event-card-today";
  if (event.atrasado) return "event-card-late";
  if (event.proximoEvento) return "event-card-upcoming";
  return "";
};

const getEventStatusLabel = (event) => {
  if (event.esHoy) return { label: "HOY", icon: "bx bx-bolt-circle", className: "status-today" };
  if (event.atrasado) return { label: "Atrasado", icon: "bx bx-error-circle", className: "status-late" };
  if (event.proximoEvento) return { label: "Proximo", icon: "bx bx-time", className: "status-upcoming" };
  return null;
};

const getPriorityLabel = (priority) => {
  const normalized = normalizePriority(priority, "baja");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getPriorityClass = (priority) => `priority-${normalizePriority(priority, "baja")}`;

const getUrgencyRank = (event) => {
  if (event.esHoy) return 0;
  if (event.proximoEvento) return 1;
  if (!event.atrasado) return 2;
  return 3;
};

const parseBackendDate = (value) => {
  if (!value) return new Date();
  if (typeof value === "string") {
    const isoDateMatch = value.match(/^\d{4}-\d{2}-\d{2}T00:00:00(\.000)?Z$/);
    if (isoDateMatch) {
      const [year, month, day] = value.slice(0, 10).split("-").map(Number);
      return new Date(year, month - 1, day);
    }
  }
  return new Date(value);
};

const normalizeMeetingItem = (meeting) => {
  const backendDate = meeting.date || meeting.start_date || meeting.startDate;
  const date = parseBackendDate(backendDate);
  const startDate = meeting.start_date || meeting.startDate || null;
  const startTime =
    meeting.startTime ||
    meeting.start_time ||
    (startDate ? new Date(startDate).toTimeString().slice(0, 5) : "");
  const duration = meeting.duration ? String(meeting.duration) : "";
  const timeLabel = startTime
    ? duration
      ? `${startTime} · ${duration}`
      : startTime
    : meeting.time || "";
  const metadata = getEventDateMetadata(date, meeting.prioridad || meeting.priority);

  return {
    id: meeting._id || meeting.id || meeting.id_meeting || `${Date.now()}-${Math.random()}`,
    date,
    title: meeting.title || "Reunión",
    desc: meeting.description || meeting.desc || "",
    time: timeLabel,
    room: meeting.room || "",
    link: meeting.link || "",
    sprint: meeting.sprint || "Sin sprint",
    sprintStatus: meeting.status || "",
    meetingType: meeting.type || "",
    startTime,
    duration,
    endTime: meeting.endTime || meeting.end_time || meeting.endDate || meeting.end_date || "",
    modificationCount: 0,
    responsible: meeting.responsable || meeting.owner || "Equipo Scrum",
    ...metadata,
  };
};

const buildProjectEvent = (project, kind, rawDate) => {
  const date = parseBackendDate(rawDate);
  if (Number.isNaN(date.getTime())) return null;

  const projectName = project.nombre || "Proyecto sin nombre";
  const kindLabel = kind === "start" ? "Inicio" : "Fin";
  const metadata = getEventDateMetadata(date, project.prioridad || (kind === "end" ? "alta" : "media"));

  return {
    id: `project-${project.id_proyecto || project.id || projectName}-${kind}`,
    source: "project",
    milestoneKind: kind,
    date,
    title: `${kindLabel}: ${projectName}`,
    desc: project.descripcion || "Sin descripcion",
    time: "Hito de proyecto",
    room: project.estado || "Sin estado",
    sprint: "Hitos de proyectos",
    sprintStatus: project.estado || "Sin estado",
    meetingType: kindLabel,
    duration: "",
    endTime: "",
    modificationCount: 0,
    responsible: project.responsable || project.product_owner || "Equipo Scrum",
    ...metadata,
    project: {
      id: project.id_proyecto || project.id,
      name: projectName,
      description: project.descripcion || "Sin descripcion",
      status: project.estado || "Sin estado",
      type: project.tipo || "Sin tipo",
      code: project.codigo_proyecto || "",
      startDate: project.startDate || project.fecha_inicio || "",
      endDate: project.endDate || project.fecha_fin_est || "",
    },
  };
};

const normalizeProjectEvents = (project) => {
  const startDate = project.startDate || project.fecha_inicio;
  const endDate = project.endDate || project.fecha_fin_est;

  return [
    startDate ? buildProjectEvent(project, "start", startDate) : null,
    endDate ? buildProjectEvent(project, "end", endDate) : null,
  ].filter(Boolean);
};

const matchesSearch = (event, term) => {
  const value = term.trim().toLowerCase();
  if (!value) return true;

  return [
    event.title,
    event.desc,
    event.room,
    event.sprint,
    event.project?.name,
    event.project?.code,
    event.project?.type,
  ]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(value));
};

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
  const [agendaNotice, setAgendaNotice] = useState(null);
  const [importantNotice, setImportantNotice] = useState(null);
  const [animateAgenda, setAnimateAgenda] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectDetail, setProjectDetail] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    try {
      const v = localStorage.getItem('selectedProjectId');
      return v ? Number(v) : null;
    } catch (e) {
      return null;
    }
  });

  const [events, setEvents] = useState([]);

  const [form, setForm] = useState({
    title: "",
    desc: "",
    date: "",
    time: "",
    room: "",
    link: "",
    startTime: "",
    endTime: "",
    sprint: "Sprint 2",
    sprintStatus: "En curso",
    meetingType: "Daily Standup",
    priority: "media",
    duration: "60",
  });

  useEffect(() => {
    setWeeks(generateCalendar(currentDate));
  }, [currentDate]);

  useEffect(() => {
    let active = true;

    const loadCalendarEvents = async () => {
      try {
        const projectsResponse = await listarProyectos();
        const proyectos = Array.isArray(projectsResponse?.data) ? projectsResponse.data : [];
        setProjects(proyectos);

        // determinar proyecto seleccionado por defecto
        let projectId = selectedProjectId;
        if (!projectId && proyectos.length > 0) {
          projectId = proyectos[0].id_proyecto || proyectos[0].id;
          setSelectedProjectId(projectId);
          try { localStorage.setItem('selectedProjectId', String(projectId)); } catch (e) {}
        }

        const meetingItems = await listarMeetings({ q: searchTerm, id_proyecto: projectId });
        if (!active) return;
        const meetings = Array.isArray(meetingItems) ? meetingItems : [];
        const meetingEvents = meetings.map(normalizeMeetingItem);
        const projectEvents = proyectos.flatMap(normalizeProjectEvents).filter((event) => matchesSearch(event, searchTerm));

        const allEvents = [...meetingEvents, ...projectEvents];
        setEvents(allEvents);

        const todayCount = allEvents.filter((event) => event.esHoy).length;
        const urgentCount = allEvents.filter((event) => event.esHoy || event.proximoEvento || event.atrasado).length;
        if (urgentCount > 0) {
          setImportantNotice(`${urgentCount} evento${urgentCount === 1 ? "" : "s"} importante${urgentCount === 1 ? "" : "s"} en tu agenda. Hoy: ${todayCount}.`);
          window.setTimeout(() => setImportantNotice(null), 5200);
        }
      } catch (error) {
        console.error("No se pudieron cargar los eventos del calendario:", error);
      }
    };

    const timer = setTimeout(loadCalendarEvents, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedProjectId]);

  // actualizar eventos cuando cambia el proyecto seleccionado
  useEffect(() => {
    try {
      localStorage.setItem('selectedProjectId', selectedProjectId ? String(selectedProjectId) : '');
    } catch (e) {}
  }, [selectedProjectId]);

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
    setForm({
      title: "",
      desc: "",
      date: formatDateForInput(selectedDate || new Date()),
      time: "",
      room: "",
      link: "",
      startTime: "",
      endTime: "",
      sprint: "Sprint 2",
      sprintStatus: "En curso",
      meetingType: "Daily Standup",
      priority: "media",
      duration: "60",
    });
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

  const getEndTimeFromStartAndDuration = (start, duration) => {
    if (!start || !duration) return "";
    const [hours, minutes] = start.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";
    const total = hours * 60 + minutes + Number(duration);
    const endHours = Math.floor(total / 60);
    const endMinutes = total % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  const getDurationFromTimes = (start, end) => {
    if (!start || !end) return "";
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    if ([sH, sM, eH, eM].some((n) => Number.isNaN(n))) return "";
    const diff = eH * 60 + eM - (sH * 60 + sM);
    return diff > 0 ? String(diff) : "";
  };

  const saveEvent = async () => {
    const dateParts = parseDateInput(form.date);
    // validar fecha mínima (no permitir fechas anteriores a hoy)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateParts < today) {
      setTimeAlert("No puedes seleccionar una fecha anterior a hoy.");
      return;
    }

    const computedEndTime = form.startTime && form.duration ? getEndTimeFromStartAndDuration(form.startTime, form.duration) : form.endTime;

    const isAfterMax = (t) => {
      if (!t) return false;
      const [h, m] = t.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return false;
      if (h > 20) return true;
      if (h === 20 && m > 0) return true;
      return false;
    };

    if (form.startTime && isAfterMax(form.startTime)) { setTimeAlert("Se pasa la hora de la reunión"); return; }
    if (computedEndTime && isAfterMax(computedEndTime)) { setTimeAlert("Se pasa la hora de la reunión"); return; }
    if (form.startTime && form.duration) {
      const s = form.startTime.split(":").map(Number);
      const e = computedEndTime.split(":").map(Number);
      const startMinutes = s[0] * 60 + s[1];
      const endMinutes = e[0] * 60 + e[1];
      if (endMinutes <= startMinutes) { setTimeAlert("La hora de fin debe ser posterior a la hora de inicio."); return; }
    }

    const savePayload = {
      title: form.title || "Sin título",
      description: form.desc || "",
      sprint: form.sprint,
      status: form.sprintStatus,
      date: form.date,
      type: form.meetingType,
      priority: form.priority,
      startTime: form.startTime || "",
      duration: form.duration,
      room: form.room || "",
      link: form.link || "",
      id_proyecto: selectedProjectId || undefined,
    };

    try {
      if (editingEventId) {
        const updated = await actualizarMeeting(editingEventId, savePayload);
        const updatedEvent = normalizeMeetingItem(updated);
        setEvents((list) =>
          list.map((ev) =>
            ev.id === editingEventId
              ? {
                  ...updatedEvent,
                  modificationCount: (ev.modificationCount || 0) + 1,
                }
              : ev
          )
        );
        setEditingEventId(null);
      } else {
        if (!selectedProjectId) throw new Error('Selecciona un proyecto antes de crear una reunión');
        const created = await crearMeeting(savePayload);
        const newEvent = normalizeMeetingItem(created);
        setEvents((e) => [newEvent, ...e]);
      }

      setCurrentDate(new Date(dateParts.getFullYear(), dateParts.getMonth(), 1));
      setSelectedDate(dateParts);
      setShowModal(false);
      setForm({ title: "", desc: "", date: "", time: "", room: "", link: "", startTime: "", endTime: "", sprint: "Sprint 2", sprintStatus: "En curso", meetingType: "Daily Standup", priority: "media", duration: "60" });
    } catch (error) {
      console.error("Error guardando reunión:", error);
      setTimeAlert("No se pudo guardar la reunión. Verifica tu sesión y vuelve a intentar.");
    }
  };

  const openEditModal = (ev) => {
    setEditingEventId(ev.id);
    // intentar extraer start/end time si el texto tiene formato HH:MM - HH:MM
    let startTime = ev.startTime || "";
    let endTime = ev.endTime || "";
    let duration = ev.duration || "";
    if (ev.time) {
      const m = String(ev.time).match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
      if (m) {
        startTime = m[1].padStart(5, "0");
        endTime = m[2].padStart(5, "0");
        duration = duration || getDurationFromTimes(startTime, endTime);
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
      sprint: ev.sprint || "Sprint 2",
      sprintStatus: ev.sprintStatus || "En curso",
      meetingType: ev.meetingType || "Daily Standup",
      priority: normalizePriority(ev.prioridad, "media"),
      duration: duration || "60",
    });
    setShowModal(true);
  };

  const openDeleteConfirm = (id) => {
    setDeleteTarget(id);
    const ev = events.find((x) => x.id === id) || null;
    setDeleteTargetEvent(ev);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget == null) return;
    try {
      await eliminarMeeting(deleteTarget);
      setEvents((e) => e.filter((x) => x.id !== deleteTarget));
      setDeleteNotice("Reunión eliminada");
      setTimeout(() => setDeleteNotice(null), 3000);
    } catch (error) {
      console.error("No se pudo eliminar la reunión:", error);
      setTimeAlert("No se pudo eliminar la reunión. Intenta nuevamente.");
    } finally {
      setDeleteTarget(null);
      setDeleteTargetEvent(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
    setShowDeleteConfirm(false);
  };

  const upcoming = useMemo(() => {
    const now = new Date();
    return events
      .slice()
      .sort((a, b) => getUrgencyRank(a) - getUrgencyRank(b) || a.date - b.date)
      .filter((e) => e.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  }, [events]);

  const urgentSummary = useMemo(() => {
    const eventosHoy = events.filter((event) => event.esHoy).length;
    const eventosUrgentes = events.filter((event) => event.esHoy || event.proximoEvento || event.atrasado).length;

    return { eventosHoy, eventosUrgentes };
  }, [events]);

  const groupedMeetings = useMemo(() => {
    return upcoming.reduce((acc, meeting) => {
      const sprintKey = meeting.sprint?.trim() || "Sin sprint";
      if (!acc[sprintKey]) acc[sprintKey] = [];
      acc[sprintKey].push(meeting);
      acc[sprintKey].sort((a, b) => getUrgencyRank(a) - getUrgencyRank(b) || a.date - b.date);
      return acc;
    }, {});
  }, [upcoming]);

  const groupedSprintKeys = useMemo(() => {
    return Object.keys(groupedMeetings).sort((a, b) => {
      const firstA = groupedMeetings[a]?.[0];
      const firstB = groupedMeetings[b]?.[0];
      const urgencyDiff = getUrgencyRank(firstA || {}) - getUrgencyRank(firstB || {});
      if (urgencyDiff !== 0) return urgencyDiff;
      const aMatch = a.match(/\d+/);
      const bMatch = b.match(/\d+/);
      if (aMatch && bMatch) return Number(aMatch[0]) - Number(bMatch[0]);
      return a.localeCompare(b);
    });
  }, [groupedMeetings]);

  const eventColors = ["#4CB200", "#FFB74D", "#B388FF", "#4DB6AC"];

  const computedEndTime = form.startTime && form.duration ? getEndTimeFromStartAndDuration(form.startTime, form.duration) : form.endTime;

  const eventsOn = (date) => events.some((ev) => isSameDay(ev.date, date));

  const eventsForSelectedDate = useMemo(
    () => events.filter((ev) => isSameDay(ev.date, selectedDate)),
    [events, selectedDate]
  );

  const handleVerAgenda = () => {
    const dateToShow = selectedDate || new Date();
    setCurrentDate(new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1));
    setSelectedDate(dateToShow);
    if (eventsForSelectedDate.length === 0) {
      setAnimateAgenda(false);
      setAgendaNotice("No tienes reuniones el día seleccionado");
      window.setTimeout(() => setAgendaNotice(null), 4000);
      return;
    }

    setAgendaNotice(null);
    setAnimateAgenda(true);
    window.setTimeout(() => setAnimateAgenda(false), 900);
  };

  return (
    <div className="detalles-container">
      <main className="main-content">
        <div className="calendar-top header-top">
          <div className="header-left">
            <h1 className="page-title">Centro de Reuniones</h1>
            <p className="subtitle muted">Aquí tienes tu agenda y próximas reuniones.</p>
          </div>

            <div className="header-right calendar-search-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ minWidth: 220 }}>
                  <select
                    value={selectedProjectId || ''}
                    onChange={(e) => {
                      const v = e.target.value ? Number(e.target.value) : null;
                      setSelectedProjectId(v);
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff' }}
                  >
                    <option value="">Seleccionar proyecto</option>
                    {projects.map((p) => (
                      <option key={p.id_proyecto || p.id} value={p.id_proyecto || p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="search-box-wide">
                <i className="bx bx-search"></i>
                <input
                  placeholder="Buscar reuniones, proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "100%", fontSize: "1.08rem", padding: "10px 16px 10px 40px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc" }}
                />
              </div>
              </div>
            </div>
        </div>

        <div className="calendar-smart-summary" aria-live="polite">
          <div className="smart-summary-card smart-summary-urgent">
            <i className="bx bx-alarm-exclamation"></i>
            <div>
              <span>Eventos urgentes</span>
              <strong>{urgentSummary.eventosUrgentes}</strong>
            </div>
          </div>
          <div className="smart-summary-card smart-summary-today">
            <i className="bx bx-calendar-star"></i>
            <div>
              <span>Eventos de hoy</span>
              <strong>{urgentSummary.eventosHoy}</strong>
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
                  <div className="summary-sub">Tienes {events.filter((ev) => isSameDay(ev.date, selectedDate)).length} eventos programados</div>
                </div>
              </div>
              <div className="summary-action">
                <button className="btn btn-outline-green" onClick={handleVerAgenda}>Ver agenda del día</button>
                {agendaNotice && <div className="agenda-notice">{agendaNotice}</div>}
              </div>
            </div>
          </div>

          <div className="calendar-events">
            <div className="events-header">
              <h2>Proximos eventos</h2>
              <button className="btn add-event-btn" id="add-event-btn" onClick={handleAdd}>
                <i className="bx bx-plus"></i> Agregar reunión
              </button>
            </div>

            <div id="event-list">
              {groupedSprintKeys.length === 0 ? (
                <p style={{ color: "#557a64", marginTop: 16 }}>
                  No hay reuniones ni hitos de proyectos para los proximos dias.
                </p>
              ) : (
                groupedSprintKeys.map((sprintKey) => {
                  return (
                    <SprintAccordion
                      key={sprintKey}
                      sprintKey={sprintKey}
                      meetings={groupedMeetings[sprintKey]}
                      eventColors={eventColors}
                      selectedDate={selectedDate}
                      animateAgenda={animateAgenda}
                      getEventStatusClass={getEventStatusClass}
                      getPriorityClass={getPriorityClass}
                      getEventStatusLabel={getEventStatusLabel}
                      getPriorityLabel={getPriorityLabel}
                      isSameDay={isSameDay}
                      setProjectDetail={setProjectDetail}
                      openDeleteConfirm={openDeleteConfirm}
                      openEditModal={openEditModal}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                    />
                  );
                })
              )}
            </div>

            <div className="events-footer">
              <div className="footer-card">
                <div className="footer-left"><i className="bx bx-calendar-alt"></i></div>
                <div className="footer-right">
                  <div className="footer-title">Total de eventos visibles</div>
                  <div className="footer-sub">{events.length} eventos programados</div>
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

            <div className="modal-field">
              <label>Título:</label>
              <input
                type="text"
                id="reunion-titulo"
                placeholder="Título de la reunión"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="modal-field">
              <label>Descripción:</label>
              <textarea
                id="reunion-desc"
                placeholder="Descripción"
                value={form.desc}
                rows={4}
                onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              />
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label>Sprint</label>
                <select
                  value={form.sprint}
                  onChange={(e) => setForm((f) => ({ ...f, sprint: e.target.value }))}
                >
                  <option>Sprint 1</option>
                  <option>Sprint 2</option>
                  <option>Sprint 3</option>
                  <option>Sprint 4</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Estado del sprint</label>
                <select
                  value={form.sprintStatus}
                  onChange={(e) => setForm((f) => ({ ...f, sprintStatus: e.target.value }))}
                >
                  <option>En curso</option>
                  <option>Planificado</option>
                  <option>Finalizado</option>
                </select>
              </div>
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label>Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  min={formatDateForInput(new Date())}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>

              <div className="modal-field">
                <label>Tipo de reunión (opcional)</label>
                <select
                  value={form.meetingType}
                  onChange={(e) => setForm((f) => ({ ...f, meetingType: e.target.value }))}
                >
                  <option>Daily Standup</option>
                  <option>Reunión de planificación</option>
                  <option>Revisión de Sprint</option>
                  <option>Retrospectiva</option>
                  <option>Reunión de seguimiento</option>
                </select>
              </div>
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label>Prioridad</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                >
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>

            <div className="modal-row three-col">
              <div className="modal-field">
                <label>Hora inicio (opcional):</label>
                <input
                  type="time"
                  max="20:00"
                  value={form.startTime || ""}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>

              <div className="modal-field">
                <label>Duración</label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora 30 min</option>
                  <option value="120">2 horas</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Hora fin (automática)</label>
                <input
                  type="text"
                  readOnly
                  value={computedEndTime || "--:--"}
                  placeholder="--:--"
                />
              </div>
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label>Sala (opcional):</label>
                <input
                  type="text"
                  value={form.room || ""}
                  onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                  placeholder="Sala 1"
                />
              </div>

              <div className="modal-field">
                <label>Link (opcional):</label>
                <input
                  type="url"
                  value={form.link || ""}
                  placeholder="https://..."
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                />
              </div>
            </div>

            <div className="modal-reunion-note">
              <strong>Duración recomendada:</strong> 15 - 120 minutos. Las reuniones más efectivas son cortas y enfocadas.
            </div>

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

      {projectDetail && (
        <div id="modal-reunion">
          <div className="modal-reunion-content project-detail-modal">
            <h3>{projectDetail.name}</h3>
            <div className="project-detail-grid">
              <div>
                <span>Estado</span>
                <strong>{projectDetail.status}</strong>
              </div>
              <div>
                <span>Tipo</span>
                <strong>{projectDetail.type}</strong>
              </div>
              <div>
                <span>Inicio</span>
                <strong>{projectDetail.startDate ? parseBackendDate(projectDetail.startDate).toLocaleDateString("es-ES") : "Sin fecha"}</strong>
              </div>
              <div>
                <span>Fin</span>
                <strong>{projectDetail.endDate ? parseBackendDate(projectDetail.endDate).toLocaleDateString("es-ES") : "Sin fecha"}</strong>
              </div>
            </div>
            {projectDetail.code && <p className="project-detail-code">Codigo: {projectDetail.code}</p>}
            <p className="project-detail-description">{projectDetail.description}</p>
            <div className="modal-reunion-actions">
              <button className="btn btn-light" onClick={() => setProjectDetail(null)}>
                Cerrar
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
      {importantNotice && (
        <div className="calendar-toast" role="status" aria-live="polite">
          <i className="bx bx-bell-ring"></i>
          <span>{importantNotice}</span>
        </div>
      )}
    </div>
  );
}
