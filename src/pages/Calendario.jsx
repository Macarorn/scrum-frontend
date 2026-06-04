import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/calendario.css";
import {
  actualizarMeeting,
  crearMeeting,
  eliminarMeeting,
  listarMeetings,
} from "../services/meetings.service";
import {
  getActiveProjectId,
  setActiveProjectId,
} from "../services/project-context.service";
import { listarProyectos } from "../services/proyectos.service";
import { listarSprintsPorProyecto } from "../services/sprint.service";
import { showInfo, showSuccess, showError } from "../utils/alerts";
import SprintAccordion from "./SprintAccordion";

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
        row.push({
          day: dayCounter,
          other: false,
          date: new Date(year, month, dayCounter),
        });
        dayCounter++;
      } else {
        row.push({
          day: nextMonthDay++,
          other: true,
          date: new Date(year, month + 1, nextMonthDay - 1),
        });
      }
    }
    weeks.push(row);
  }

  return weeks;
}

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const startOfDay = (value = new Date()) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const normalizePriority = (value, fallback = "media") => {
  const priority = String(value || fallback).toLowerCase();
  if (["alta", "media", "baja", "estandar"].includes(priority)) return priority;
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
    prioridad: normalizePriority(
      priority,
      esHoy || atrasado ? "alta" : proximoEvento ? "media" : "baja",
    ),
  };
};

const getEventStatusClass = (event) => {
  if (event.esHoy) return "event-card-today";
  if (event.atrasado) return "event-card-late";
  if (event.proximoEvento) return "event-card-upcoming";
  return "";
};

const getEventStatusLabel = (event) => {
  if (event.esHoy)
    return {
      label: "HOY",
      icon: "bx bx-bolt-circle",
      className: "status-today",
    };
  if (event.atrasado)
    return {
      label: "Atrasado",
      icon: "bx bx-error-circle",
      className: "status-late",
    };
  if (event.proximoEvento)
    return {
      label: "Proximo",
      icon: "bx bx-time",
      className: "status-upcoming",
    };
  return null;
};

const getPriorityLabel = (priority) => {
  const normalized = normalizePriority(priority, "baja");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getPriorityClass = (priority) =>
  `priority-${normalizePriority(priority, "baja")}`;

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

const normalizeMeetingItem = (meeting, proyectos) => {
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
  const metadata = getEventDateMetadata(
    date,
    meeting.prioridad || meeting.priority,
  );

  return {
    id:
      meeting._id ||
      meeting.id ||
      meeting.id_meeting ||
      `${Date.now()}-${Math.random()}`,
    source: "meeting",
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
    endTime:
      meeting.endTime ||
      meeting.end_time ||
      meeting.endDate ||
      meeting.end_date ||
      "",
    modificationCount: 0,
    responsible: meeting.responsable || meeting.owner || "",
    id_proyecto: meeting.id_proyecto || null,
    projectName: meeting.id_proyecto ? proyectos.find(p => String(p.id_proyecto) === String(meeting.id_proyecto))?.nombre : "",
    canManage: meeting.id_proyecto ? ["Product Owner", "Scrum Master"].includes(proyectos.find(p => String(p.id_proyecto) === String(meeting.id_proyecto))?.user_role) : false,
    ...metadata,
  };
};

const buildProjectEvent = (project, kind, rawDate) => {
  const date = parseBackendDate(rawDate);
  if (Number.isNaN(date.getTime())) return null;

  const projectName = project.nombre || "Proyecto sin nombre";
  const kindLabel = kind === "start" ? "Inicio" : "Fin";
  const metadata = getEventDateMetadata(
    date,
    project.prioridad || (kind === "end" ? "alta" : "media"),
  );

  return {
    id: `project-${project.id_proyecto || project.id || projectName}-${kind}`,
    source: "project",
    milestoneKind: kind,
    date,
    title: `${kindLabel}: ${projectName}`,
    projectName: projectName,
    desc: project.descripcion || "Sin descripcion",
    time: "Hito de proyecto",
    room: project.estado || "Sin estado",
    sprint: "Hitos de proyectos",
    sprintStatus: project.estado || "Sin estado",
    meetingType: kindLabel,
    duration: "",
    endTime: "",
    modificationCount: 0,
    responsible: project.responsable || project.product_owner || "",
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
  const navigate = useNavigate();
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
  const [agendaNotice, setAgendaNotice] = useState(null);
  const [animateAgenda, setAnimateAgenda] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectDetail, setProjectDetail] = useState(null);
  const [mobileTab, setMobileTab] = useState("calendar"); // "calendar" o "events"
  const [meetingDetail, setMeetingDetail] = useState(null);

  const [proyectos, setProyectos] = useState([]);
  const [selectedProyecto, setSelectedProyecto] = useState(getActiveProjectId() || "");
  const [canAddMeeting, setCanAddMeeting] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [projectMenuRight, setProjectMenuRight] = useState(false);
  const [sprints, setSprints] = useState([]);

  const [events, setEvents] = useState([]);
  const [popoverAnchor, setPopoverAnchor] = useState(null); // { date, x, y, events }

  const managedProjects = useMemo(() => {
    return proyectos.filter(p => ["Product Owner", "Scrum Master"].includes(p.user_role));
  }, [proyectos]);

  const notificationShownRef = useRef(false);

  const [form, setForm] = useState({
    id_proyecto: selectedProyecto,
    title: "",
    desc: "",
    date: "",
    time: "",
    room: "",
    link: "",
    startTime: "",
    endTime: "",
    sprint: "",
    sprintId: null,
    sprintStatus: "",
    meetingType: "Daily Standup",
    priority: "estandar",
    duration: "15",
    noSprint: false,
  });

  useEffect(() => {
    setWeeks(generateCalendar(currentDate));
  }, [currentDate]);

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const response = await listarProyectos();
        const lista = response.data || [];
        setProyectos(lista);

        if (lista.length > 0 && !selectedProyecto) {
          // Si no hay proyecto seleccionado pero hay lista, opcionalmente podríamos seleccionar el primero
          // o dejarlo vacío para "Todos los proyectos"
        }
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      }
    };
    cargarProyectos();
  }, []);

  useEffect(() => {
    setCanAddMeeting(managedProjects.length > 0);
  }, [managedProjects]);

  useEffect(() => {
    let active = true;

    const loadCalendarEvents = async () => {
      try {
        const [meetingItems, projectsResponse] = await Promise.all([
          listarMeetings({ q: searchTerm, id_proyecto: selectedProyecto }),
          listarProyectos(),
        ]);
        if (!active) return;

        const meetings = Array.isArray(meetingItems) ? meetingItems : [];
        const projects = Array.isArray(projectsResponse?.data)
          ? projectsResponse.data
          : [];

        // cargar sprints del proyecto seleccionado
        if (selectedProyecto && active) {
          const sprintsData = await listarSprintsPorProyecto(selectedProyecto);
          if (active) {
            setSprints(Array.isArray(sprintsData) ? sprintsData : []);
          }
        }

        const meetingEvents = meetings.map(m => normalizeMeetingItem(m, projects));
        const projectEvents = projects
          .filter(p => !selectedProyecto || String(p.id_proyecto) === String(selectedProyecto))
          .flatMap(normalizeProjectEvents)
          .filter((event) => matchesSearch(event, searchTerm));

        const allEvents = [...meetingEvents, ...projectEvents];
        setEvents(allEvents);
      } catch (error) {
        console.error(
          "No se pudieron cargar los eventos del calendario:",
          error,
        );
      }
    };

    const timer = setTimeout(loadCalendarEvents, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedProyecto]);

  // Abrir modal de reunión si viene de notificación
  useEffect(() => {
    const openMeetingId = localStorage.getItem('openMeetingId');
    const openMeetingProject = localStorage.getItem('openMeetingProject');

    if (openMeetingId && openMeetingProject) {
      // Esperar a que los eventos estén cargados
      const timer = setTimeout(() => {
        const meeting = events.find((ev) => String(ev.id) === String(openMeetingId));
        if (meeting) {
          setMeetingDetail(meeting);
          // Limpiar localStorage
          localStorage.removeItem('openMeetingId');
          localStorage.removeItem('openMeetingProject');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [events]);

  // cerrar menú de opciones al hacer clic fuera y al hacer scroll
  useEffect(() => {
    const handleCloseMenus = (e) => {
      if (e.type === "scroll" || (!e.target.closest(".backlog-epica-picker") && !e.target.closest(".day-popover"))) {
        setProjectMenuOpen(false);
        setPopoverAnchor(null);
      }
      if (e.type !== "scroll") {
        setMenuOpenId(null);
      }
    };

    document.addEventListener("click", handleCloseMenus);
    window.addEventListener("scroll", handleCloseMenus, true); // Use capture to detect scroll on any element

    return () => {
      document.removeEventListener("click", handleCloseMenus);
      window.removeEventListener("scroll", handleCloseMenus, true);
    };
  }, []);

  const prevMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleAdd = () => {
    setEditingEventId(null);
    const isManaged = managedProjects.some(p => String(p.id_proyecto) === String(selectedProyecto));

    // encontrar sprint en curso si existe
    const activeSprint = sprints.find(s => s.estado === 'en_curso');
    const defaultSprint = activeSprint || (sprints.length > 0 ? sprints[0] : null);

    setForm({
      id_proyecto: isManaged ? selectedProyecto : "",
      title: "",
      desc: "",
      date: formatDateForInput(selectedDate || new Date()),
      time: "",
      room: "",
      link: "",
      startTime: "",
      endTime: "",
      sprint: defaultSprint ? defaultSprint.nombre : "",
      sprintId: defaultSprint ? defaultSprint.id_sprint : null,
      sprintStatus: defaultSprint ? defaultSprint.estado : "",
      meetingType: "Daily Standup",
      priority: "estandar",
      duration: "15",
      noSprint: !defaultSprint,
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

  const MEETING_TYPE_DURATIONS = {
    "Daily Standup": "15",
    "Reunión de planificación": "60",
    "Revisión de Sprint": "60",
    "Retrospectiva": "45",
    "Reunión de seguimiento": "30",
  };

  const handleMeetingTypeChange = (type) => {
    setForm((f) => ({
      ...f,
      meetingType: type,
      duration: MEETING_TYPE_DURATIONS[type] || "60",
    }));
  };

  const handleStartTimeChange = (startTime) => {
    setForm((f) => ({
      ...f,
      startTime,
      endTime: getEndTimeFromStartAndDuration(startTime, f.duration),
    }));
  };

  const handleEndTimeChange = (endTime) => {
    const duration = getDurationFromTimes(form.startTime, endTime);
    setForm((f) => ({
      ...f,
      endTime,
      duration: duration || f.duration,
    }));
  };

  const handleDurationChange = (duration) => {
    setForm((f) => ({
      ...f,
      duration,
      endTime: getEndTimeFromStartAndDuration(f.startTime, duration),
    }));
  };

  const handleSprintChange = (sprintValue) => {
    if (sprintValue === "") {
      setForm((f) => ({
        ...f,
        sprint: "",
        sprintId: null,
        sprintStatus: "",
        noSprint: true,
      }));
    } else {
      const selectedSprint = sprints.find(s => s.nombre === sprintValue);
      setForm((f) => ({
        ...f,
        sprint: sprintValue,
        sprintId: selectedSprint ? selectedSprint.id_sprint : null,
        sprintStatus: selectedSprint ? selectedSprint.estado : "",
        noSprint: false,
      }));
    }
  };

  const saveEvent = async () => {
    const dateParts = parseDateInput(form.date);
    // validar fecha mínima (no permitir fechas anteriores a hoy)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateParts < today) {
      showError("No puedes seleccionar una fecha anterior a hoy.");
      return;
    }

    if (!form.id_proyecto) {
      showError("Debes seleccionar un proyecto para la reunión.");
      return;
    }

    if (!form.title.trim()) {
      showError("El título de la reunión es obligatorio.");
      return;
    }

    const computedEndTime =
      form.startTime && form.duration
        ? getEndTimeFromStartAndDuration(form.startTime, form.duration)
        : form.endTime;

    const isAfterMax = (t) => {
      if (!t) return false;
      const [h, m] = t.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) return false;
      if (h > 20) return true;
      if (h === 20 && m > 0) return true;
      return false;
    };

    if (form.startTime && isAfterMax(form.startTime)) {
      showError("Se pasa la hora de la reunión");
      return;
    }
    if (computedEndTime && isAfterMax(computedEndTime)) {
      showError("Se pasa la hora de la reunión");
      return;
    }
    if (form.startTime && form.duration) {
      const s = form.startTime.split(":").map(Number);
      const e = computedEndTime.split(":").map(Number);
      const startMinutes = s[0] * 60 + s[1];
      const endMinutes = e[0] * 60 + e[1];
      if (endMinutes <= startMinutes) {
        showError("La hora de fin debe ser posterior a la hora de inicio.");
        return;
      }
    }

    // Validar que la hora de inicio esté llena
    if (!form.startTime || form.startTime.trim() === "") {
      showError("La hora de inicio es obligatoria.");
      return;
    }

    const savePayload = {
      id_proyecto: form.id_proyecto || null,
      title: form.title || "Sin título",
      description: form.desc || "",
      sprint: form.noSprint ? "" : (form.sprint || "Sin sprint"),
      status: form.sprintStatus || "",
      date: form.date,
      type: form.meetingType,
      priority: form.priority,
      startTime: form.startTime || "",
      duration: form.duration,
      room: form.room || "",
      link: form.link || "",
    };

    try {
      if (editingEventId) {
        const updated = await actualizarMeeting(editingEventId, savePayload);
        const updatedEvent = normalizeMeetingItem(updated, proyectos);
        setEvents((list) =>
          list.map((ev) =>
            ev.id === editingEventId
              ? {
                ...updatedEvent,
                modificationCount: (ev.modificationCount || 0) + 1,
              }
              : ev,
          ),
        );
        setEditingEventId(null);
        showSuccess("Reunión actualizada con éxito");
      } else {
        const created = await crearMeeting(savePayload);
        const newEvent = normalizeMeetingItem(created, proyectos);
        setEvents((e) => [newEvent, ...e]);
        showSuccess("Reunión creada con éxito");
      }

      setCurrentDate(
        new Date(dateParts.getFullYear(), dateParts.getMonth(), 1),
      );
      setSelectedDate(dateParts);
      setShowModal(false);
      const isManagedReset = managedProjects.some(p => String(p.id_proyecto) === String(selectedProyecto));
      const activeSprint = sprints.find(s => s.estado === 'en_curso');
      const defaultSprint = activeSprint || (sprints.length > 0 ? sprints[0] : null);
      setForm({
        id_proyecto: isManagedReset ? selectedProyecto : "",
        title: "",
        desc: "",
        date: "",
        time: "",
        room: "",
        link: "",
        startTime: "",
        endTime: "",
        sprint: defaultSprint ? defaultSprint.nombre : "",
        sprintId: defaultSprint ? defaultSprint.id_sprint : null,
        sprintStatus: defaultSprint ? defaultSprint.estado : "",
        meetingType: "Daily Standup",
        priority: "estandar",
        duration: "15",
        noSprint: !defaultSprint,
      });
    } catch (error) {
      console.error("Error guardando reunión:", error);
      showError("No se pudo guardar la reunión. Verifica tu sesión y vuelve a intentar.");
    }
  };

  const openEditModal = (ev) => {
    setEditingEventId(ev.id);
    // intentar extraer start/end time si el texto tiene formato HH:MM - HH:MM
    let startTime = ev.startTime || "";
    let endTime = ev.endTime || "";
    let duration = ev.duration || "";
    if (ev.time) {
      const m = String(ev.time).match(
        /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/,
      );
      if (m) {
        startTime = m[1].padStart(5, "0");
        endTime = m[2].padStart(5, "0");
        duration = duration || getDurationFromTimes(startTime, endTime);
      }
    }
    setForm({
      id_proyecto: ev.id_proyecto || ev.project?.id || null,
      title: ev.title || "",
      desc: ev.desc || "",
      date: formatDateForInput(ev.date),
      time: ev.time || "",
      room: ev.room || "",
      link: ev.link || "",
      startTime,
      endTime,
      sprint: ev.sprint || "",
      sprintId: null,
      sprintStatus: ev.sprintStatus || "",
      meetingType: ev.meetingType || "Daily Standup",
      priority: normalizePriority(ev.prioridad, "estandar"),
      duration: duration || "15",
      noSprint: !ev.sprint,
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
      showSuccess("Reunión eliminada con éxito");
    } catch (error) {
      console.error("No se pudo eliminar la reunión:", error);
      showError("No se pudo eliminar la reunión. Intenta nuevamente.");
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
    const today = startOfDay();
    return events
      .slice()
      .sort((a, b) => getUrgencyRank(a) - getUrgencyRank(b) || a.date - b.date)
      .filter((e) => startOfDay(e.date) >= today);
  }, [events]);

  const pastEvents = useMemo(() => {
    const today = startOfDay();
    return events
      .filter((e) => startOfDay(e.date) < today)
      .sort((a, b) => b.date - a.date);
  }, [events]);

  const urgentSummary = useMemo(() => {
    const eventosHoy = events.filter((event) => event.esHoy).length;
    const eventosUrgentes = events.filter(
      (event) => event.esHoy || event.proximoEvento || event.atrasado,
    ).length;

    return { eventosHoy, eventosUrgentes };
  }, [events]);

  useEffect(() => {
    if (urgentSummary.eventosUrgentes > 0 && !notificationShownRef.current) {
      const mensaje = `${urgentSummary.eventosUrgentes} eventos importantes en tu agenda. Hoy: ${urgentSummary.eventosHoy}`;
      showInfo(mensaje);
      notificationShownRef.current = true;
    }
  }, [urgentSummary]);

  const groupedMeetings = useMemo(() => {
    return upcoming.reduce((acc, meeting) => {
      let sprintKey = meeting.sprint?.trim() || "Sin sprint";

      // Si estamos viendo todos los proyectos, añadimos el nombre del proyecto al encabezado del sprint
      if (!selectedProyecto && meeting.id_proyecto) {
        const proyecto = proyectos.find(p => String(p.id_proyecto) === String(meeting.id_proyecto));
        if (proyecto) {
          sprintKey = `${proyecto.nombre} - ${sprintKey}`;
        }
      }

      if (!acc[sprintKey]) acc[sprintKey] = [];
      acc[sprintKey].push(meeting);
      acc[sprintKey].sort(
        (a, b) => getUrgencyRank(a) - getUrgencyRank(b) || a.date - b.date,
      );
      return acc;
    }, {});
  }, [upcoming, selectedProyecto, proyectos]);

  const groupedSprintKeys = useMemo(() => {
    return Object.keys(groupedMeetings).sort((a, b) => {
      const firstA = groupedMeetings[a]?.[0];
      const firstB = groupedMeetings[b]?.[0];
      const urgencyDiff =
        getUrgencyRank(firstA || {}) - getUrgencyRank(firstB || {});
      if (urgencyDiff !== 0) return urgencyDiff;
      const aMatch = a.match(/\d+/);
      const bMatch = b.match(/\d+/);
      if (aMatch && bMatch) return Number(aMatch[0]) - Number(bMatch[0]);
      return a.localeCompare(b);
    });
  }, [groupedMeetings]);

  const eventColors = ["#4CB200", "#FFB74D", "#B388FF", "#4DB6AC"];

  const computedEndTime =
    form.startTime && form.duration
      ? getEndTimeFromStartAndDuration(form.startTime, form.duration)
      : form.endTime;

  const eventsOn = (date) => {
    return events.some((ev) => isSameDay(ev.date, date));
  };

  const eventsForSelectedDate = useMemo(
    () => events.filter((ev) => isSameDay(ev.date, selectedDate)),
    [events, selectedDate],
  );

  const handleVerAgenda = () => {
    const dateToShow = selectedDate || new Date();
    setCurrentDate(
      new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1),
    );
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
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <h1 className="page-title">Centro de Reuniones</h1>
              <div className="backlog-epica-picker">
                <button
                  type="button"
                  className="backlog-epica-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const shouldRight = window.innerWidth - rect.right < 360;
                    setProjectMenuRight(shouldRight);
                    setProjectMenuOpen((prev) => !prev);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={projectMenuOpen}
                >
                  <span>
                    {proyectos.find(
                      (p) => String(p.id_proyecto) === String(selectedProyecto),
                    )?.nombre || "Todos los proyectos"}
                  </span>
                  <span className="backlog-epica-caret">▾</span>
                </button>

                {projectMenuOpen && (
                  <div
                    className={`backlog-epica-menu ${projectMenuRight ? "menu-right" : ""}`}
                    role="menu"
                  >
                    <button
                      type="button"
                      className="backlog-epica-all"
                      onClick={() => {
                        setSelectedProyecto("");
                        setActiveProjectId("");
                        setProjectMenuOpen(false);
                      }}
                    >
                      Ver todos los proyectos
                    </button>
                    <div className="backlog-epica-menu-list">
                      {proyectos.map((proyecto) => (
                        <button
                          key={proyecto.id_proyecto}
                          type="button"
                          className={`backlog-epica-item ${String(proyecto.id_proyecto) === String(selectedProyecto) ? "selected" : ""}`}
                          onClick={() => {
                            const nextProyecto = String(proyecto.id_proyecto);
                            setSelectedProyecto(nextProyecto);
                            setActiveProjectId(nextProyecto);
                            setProjectMenuOpen(false);
                          }}
                        >
                          <span className="backlog-epica-item-name">
                            {proyecto.nombre}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="subtitle muted" style={{ marginTop: 8 }}>
              Aquí tienes tu agenda y próximas reuniones.
            </p>
          </div>

          <div className="header-right calendar-search-bar">
            <div className="search-box-wide">
              <i className="bx bx-search"></i>
              <input
                placeholder="Buscar reuniones, proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {canAddMeeting && (
              <button
                className="btn add-event-btn header-add-btn"
                id="add-event-btn"
                onClick={handleAdd}
              >
                <i className="bx bx-plus"></i> Agregar reunión
              </button>
            )}
          </div>
        </div>

        <div className="calendar-layout">
          {/* Tabs para móvil muy pequeño */}
          <div className="calendar-mobile-tabs">
            <button
              className={`tab-btn ${mobileTab === "calendar" ? "active" : ""}`}
              onClick={() => setMobileTab("calendar")}
            >
              <i className="bx bx-calendar"></i>
              <span>Calendario</span>
            </button>
            <button
              className={`tab-btn ${mobileTab === "events" ? "active" : ""}`}
              onClick={() => setMobileTab("events")}
            >
              <i className="bx bx-list-ul"></i>
              <span>Próximos ({upcoming.length})</span>
            </button>
          </div>

          <div className="calendar-left-col">
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

            <div
              className={`calendar-box ${mobileTab === "calendar" ? "show-tab" : "hide-tab"}`}
            >
              <div className="calendar-header">
                <div className="calendar-nav">
                  <i
                    className="bx bx-chevron-left"
                    onClick={prevMonth}
                    aria-hidden="true"
                  ></i>
                  <i
                    className="bx bx-calendar"
                    id="calendar-picker-btn"
                    onClick={() => setShowPicker((s) => !s)}
                    aria-hidden="true"
                  ></i>
                  <i
                    className="bx bx-chevron-right"
                    onClick={nextMonth}
                    aria-hidden="true"
                  ></i>
                  <span
                    id="calendar-current-title"
                    className="calendar-current-title"
                  >
                    {currentDate.toLocaleString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="calendar-actions">
                  <button
                    className="btn btn-light small-btn"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Hoy
                  </button>
                </div>

                {showPicker && (
                  <div
                    id="calendar-picker"
                    className="calendar-picker-hidden"
                    style={{ display: "block" }}
                  >
                    <select
                      id="calendar-month"
                      value={currentDate.getMonth()}
                      onChange={(e) =>
                        setCurrentDate(
                          new Date(
                            currentDate.getFullYear(),
                            Number(e.target.value),
                            1,
                          ),
                        )
                      }
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i}>
                          {new Date(0, i).toLocaleString("es-ES", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                    <select
                      id="calendar-year"
                      value={currentDate.getFullYear()}
                      onChange={(e) =>
                        setCurrentDate(
                          new Date(
                            Number(e.target.value),
                            currentDate.getMonth(),
                            1,
                          ),
                        )
                      }
                    >
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
                            onClick={(e) => {
                              e.stopPropagation();
                              if (cell.other) {
                                setCurrentDate(
                                  new Date(
                                    cell.date.getFullYear(),
                                    cell.date.getMonth(),
                                    1,
                                  ),
                                );
                                return;
                              }
                              setSelectedDate(cell.date);

                              const dayEvents = events.filter((ev) => {
                                const evDate = new Date(ev.date);
                                const cellDate = new Date(cell.date);
                                return (
                                  evDate.getDate() === cellDate.getDate() &&
                                  evDate.getMonth() === cellDate.getMonth() &&
                                  evDate.getFullYear() === cellDate.getFullYear()
                                );
                              });

                              if (dayEvents.length > 0) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setPopoverAnchor({
                                  date: new Date(cell.date),
                                  x: rect.left + rect.width / 2,
                                  y: rect.top,
                                  events: dayEvents,
                                });
                              } else {
                                setPopoverAnchor(null);
                              }
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

            </div>
          </div>

          <div
            className={`calendar-events ${mobileTab === "events" ? "show-tab" : "hide-tab"}`}
          >
            <div className="events-header">
              <h2>Eventos</h2>
            </div>

            <div id="event-list">
              {upcoming.length === 0 && pastEvents.length === 0 ? (
                <p style={{ color: "#557a64", marginTop: 16 }}>
                  No hay reuniones ni hitos de proyectos.
                </p>
              ) : (
                <>
                  {groupedSprintKeys.map((sprintKey) => (
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
                      setMeetingDetail={setMeetingDetail}
                      openDeleteConfirm={openDeleteConfirm}
                      openEditModal={openEditModal}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                    />
                  ))}

                  {pastEvents.length > 0 && (
                    <SprintAccordion
                      key="pasados"
                      sprintKey="Eventos pasados"
                      meetings={pastEvents}
                      eventColors={eventColors}
                      selectedDate={selectedDate}
                      animateAgenda={animateAgenda}
                      getEventStatusClass={getEventStatusClass}
                      getPriorityClass={getPriorityClass}
                      getEventStatusLabel={getEventStatusLabel}
                      getPriorityLabel={getPriorityLabel}
                      isSameDay={isSameDay}
                      setProjectDetail={setProjectDetail}
                      setMeetingDetail={setMeetingDetail}
                      openDeleteConfirm={openDeleteConfirm}
                      openEditModal={openEditModal}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                    />
                  )}
                </>
              )}
            </div>

            <div className="events-footer" style={{ display: "none" }}>
              <div className="footer-card">
                <div className="footer-left">
                  <i className="bx bx-calendar-alt"></i>
                </div>
                <div className="footer-right">
                  <div className="footer-title">Total de eventos visibles</div>
                  <div className="footer-sub">
                    {events.length} eventos programados
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {popoverAnchor && (
          <motion.div
            className="day-popover"
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-90%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-100%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-90%" }}
            style={{
              position: "fixed",
              top: popoverAnchor.y - 10,
              left: popoverAnchor.x,
              zIndex: 999999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="popover-header">
              <span className="popover-date">
                {popoverAnchor.date.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <button
                className="popover-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverAnchor(null);
                }}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>
            <div className="popover-content">
              {popoverAnchor.events.map((ev) => (
                <div
                  key={ev.id}
                  className="popover-event-item"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ev.source === "project") {
                      setProjectDetail(ev.project);
                    } else {
                      setMeetingDetail(ev);
                    }
                    setPopoverAnchor(null);
                  }}
                >
                  <span
                    className="popover-event-dot"
                    style={{
                      backgroundColor:
                        ev.source === "project"
                          ? "#39a900"
                          : ev.prioridad === "alta"
                            ? "#d94d4d"
                            : ev.prioridad === "media"
                              ? "#d89a4a"
                              : ev.prioridad === "estandar"
                                ? "#9ca3af"
                                : "#557a64",
                    }}
                  ></span>
                  <span className="popover-event-title">{ev.title}</span>
                </div>
              ))}
            </div>
            <div className="popover-footer">
              <button
                className="popover-agenda-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVerAgenda();
                  setPopoverAnchor(null);
                }}
              >
                Ver agenda del día
              </button>
            </div>
            <div className="popover-arrow"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && (
        <div id="modal-reunion" onClick={() => setShowModal(false)}>
          <div className="modal-reunion-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingEventId ? "Editar reunión" : "Nueva reunión"}
            </h3>

            <div className="modal-field">
              <label>Proyecto *</label>
              <select
                required
                value={form.id_proyecto || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, id_proyecto: e.target.value }))
                }
              >
                <option value="" disabled>Selecciona un proyecto</option>
                {managedProjects.map((p) => (
                  <option key={p.id_proyecto} value={p.id_proyecto}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-field">
              <label>Título *:</label>
              <input
                type="text"
                id="reunion-titulo"
                placeholder="Título de la reunión"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div className="modal-field">
              <label>Descripción:</label>
              <textarea
                id="reunion-desc"
                placeholder="Descripción"
                value={form.desc}
                rows={4}
                onChange={(e) =>
                  setForm((f) => ({ ...f, desc: e.target.value }))
                }
              />
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label>Sprint</label>
                <select
                  value={form.sprint}
                  onChange={(e) => handleSprintChange(e.target.value)}
                >
                  <option value="">Sin sprint</option>
                  {sprints.map((s) => (
                    <option key={s.id_sprint} value={s.nombre}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label>Prioridad</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value }))
                  }
                >
                  <option value="estandar">Estándar</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>

            {form.sprint && (
              <div className="modal-field">
                <label>Estado del sprint</label>
                <input
                  type="text"
                  value={form.sprintStatus || ""}
                  readOnly
                  style={{ background: "#f5f5f5", cursor: "default" }}
                />
              </div>
            )}

            <div className="modal-row">
              <div className="modal-field">
                <label>Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  min={formatDateForInput(new Date())}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
              </div>

              <div className="modal-field">
                <label>Tipo de reunión (opcional)</label>
                <select
                  value={form.meetingType}
                  onChange={(e) => handleMeetingTypeChange(e.target.value)}
                >
                  <option>Daily Standup</option>
                  <option>Reunión de planificación</option>
                  <option>Revisión de Sprint</option>
                  <option>Retrospectiva</option>
                  <option>Reunión de seguimiento</option>
                </select>
              </div>
            </div>

            <div className="modal-row three-col">
              <div className="modal-field">
                <label>Hora inicio:</label>
                <input
                  type="time"
                  max="20:00"
                  value={form.startTime || ""}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                />
              </div>

              <div className="modal-field">
                <label>Hora fin:</label>
                <input
                  type="time"
                  max="20:00"
                  value={form.endTime || ""}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label>Duración</label>
                <select
                  value={form.duration}
                  onChange={(e) => handleDurationChange(e.target.value)}
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="90">1 hora 30 min</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div className="modal-row">
              <div className="modal-field">
                <label>Sala (opcional):</label>
                <input
                  type="text"
                  value={form.room || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, room: e.target.value }))
                  }
                  placeholder="Sala 1"
                />
              </div>

              <div className="modal-field">
                <label>Link (opcional):</label>
                <input
                  type="url"
                  value={form.link || ""}
                  placeholder="https://..."
                  onChange={(e) =>
                    setForm((f) => ({ ...f, link: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="modal-reunion-note">
              <strong>Duración recomendada:</strong> 15 - 120 minutos. Las
              reuniones más efectivas son cortas y enfocadas.
            </div>

            <div className="modal-reunion-actions">
              <button
                id="guardar-reunion"
                className="btn"
                onClick={saveEvent}
                style={{ background: "var(--menu-green)", color: "#fff" }}
              >
                Guardar
              </button>
              <button
                id="cerrar-modal-reunion"
                className="btn btn-light"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="delete-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="delete-modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-modal-header">
                <h3>¿Eliminar reunión?</h3>
              </div>

              <div className="delete-modal-body">
                <p>
                  Esta acción no se puede deshacer. Se eliminará la reunión:
                </p>
                <div style={{ fontSize: "1.1rem", color: "#1e293b", fontWeight: 700, marginTop: "8px" }}>
                  {deleteTargetEvent?.title || "Reunión seleccionada"}
                </div>
              </div>

              <div className="delete-modal-footer">
                <button className="btn btn-ghost" onClick={cancelDelete}>
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  <i className="bx bx-trash"></i> Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {projectDetail && (
          <motion.div
            id="modal-reunion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProjectDetail(null)}
          >
            <motion.div
              className="modal-reunion-content project-detail-modal-enhanced"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="project-modal-header">
                <div className="project-modal-title-box">
                  <div className="project-modal-icon">
                    <i className="bx bx-briefcase"></i>
                  </div>
                  <div>
                    <h3>{projectDetail.name}</h3>
                    <span className="project-modal-type">{projectDetail.type || "Proyecto de equipo"}</span>
                  </div>
                </div>
                <button className="project-modal-close" onClick={() => setProjectDetail(null)}>
                  <i className="bx bx-x"></i>
                </button>
              </div>

              <div className="project-modal-body">
                <div className="project-modal-grid">
                  <div className="project-modal-item">
                    <div className="item-icon status-icon">
                      <i className="bx bx-info-circle"></i>
                    </div>
                    <div className="item-content">
                      <span>Estado</span>
                      <strong className={`status-pill ${String(projectDetail.status).toLowerCase()}`}>
                        {projectDetail.status}
                      </strong>
                    </div>
                  </div>

                  <div className="project-modal-item">
                    <div className="item-icon code-icon">
                      <i className="bx bx-code-alt"></i>
                    </div>
                    <div className="item-content">
                      <span>Código</span>
                      <strong>{projectDetail.code || "N/A"}</strong>
                    </div>
                  </div>

                  <div className="project-modal-item">
                    <div className="item-icon calendar-icon">
                      <i className="bx bx-calendar-event"></i>
                    </div>
                    <div className="item-content">
                      <span>Fecha Inicio</span>
                      <strong>
                        {projectDetail.startDate
                          ? parseBackendDate(projectDetail.startDate).toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' })
                          : "Sin fecha"}
                      </strong>
                    </div>
                  </div>

                  <div className="project-modal-item">
                    <div className="item-icon calendar-icon-end">
                      <i className="bx bx-calendar-check"></i>
                    </div>
                    <div className="item-content">
                      <span>Fecha Fin</span>
                      <strong>
                        {projectDetail.endDate
                          ? parseBackendDate(projectDetail.endDate).toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' })
                          : "Sin fecha"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="project-modal-section">
                  <label><i className="bx bx-align-left"></i> Descripción</label>
                  <div className="project-modal-description">
                    {projectDetail.description || "Este proyecto no tiene una descripción detallada aún."}
                  </div>
                </div>
              </div>

              <div className="project-modal-footer">
                <button
                  className="btn btn-primary-green"
                  onClick={() => navigate(`/detalles_de_proyecto/${projectDetail.id}`)}
                >
                  <i className="bx bx-right-arrow-alt"></i> Ver proyecto completo
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setProjectDetail(null)}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {meetingDetail && (
          <motion.div
            id="modal-reunion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMeetingDetail(null)}
          >
            <motion.div
              className="modal-reunion-content meeting-detail-modal"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="project-modal-header">
                <div className="project-modal-title-box">
                  <h3 className="project-modal-title">{meetingDetail.title}</h3>
                  <span className="project-modal-type">{meetingDetail.meetingType || "Reunión"}</span>
                </div>
                <button className="project-modal-close" onClick={() => setMeetingDetail(null)}>
                  <i className="bx bx-x"></i>
                </button>
              </div>

              <div className="project-modal-body">
                <div className="project-modal-section">
                  <h4 className="project-modal-section-title">Descripción</h4>
                  <p className="project-modal-description">
                    {meetingDetail.desc || "Sin descripción"}
                  </p>
                </div>

                <div className="project-modal-grid">
                  <div className="project-modal-info-item">
                    <span className="project-modal-info-label">Fecha</span>
                    <span className="project-modal-info-value">
                      {new Date(meetingDetail.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="project-modal-info-item">
                    <span className="project-modal-info-label">Hora inicio</span>
                    <span className="project-modal-info-value">
                      {meetingDetail.startTime || "No especificada"}
                    </span>
                  </div>

                  <div className="project-modal-info-item">
                    <span className="project-modal-info-label">Hora fin</span>
                    <span className="project-modal-info-value">
                      {meetingDetail.endTime || "No especificada"}
                    </span>
                  </div>

                  <div className="project-modal-info-item">
                    <span className="project-modal-info-label">Duración</span>
                    <span className="project-modal-info-value">
                      {meetingDetail.duration ? `${meetingDetail.duration} minutos` : "No especificada"}
                    </span>
                  </div>

                  <div className="project-modal-info-item">
                    <span className="project-modal-info-label">Sprint</span>
                    <span className="project-modal-info-value">
                      {meetingDetail.sprint || "Sin sprint"}
                    </span>
                  </div>

                  <div className="project-modal-info-item">
                    <span className="project-modal-info-label">Prioridad</span>
                    <span className={`event-priority-badge priority-${meetingDetail.prioridad || 'estandar'}`}>
                      {meetingDetail.prioridad === "estandar" ? "Estándar" :
                        meetingDetail.prioridad?.charAt(0).toUpperCase() + meetingDetail.prioridad?.slice(1) || "Estándar"}
                    </span>
                  </div>

                  {meetingDetail.room && (
                    <div className="project-modal-info-item">
                      <span className="project-modal-info-label">Sala</span>
                      <span className="project-modal-info-value">{meetingDetail.room}</span>
                    </div>
                  )}

                  {meetingDetail.link && (
                    <div className="project-modal-info-item">
                      <span className="project-modal-info-label">Link</span>
                      <a
                        href={meetingDetail.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-modal-info-value"
                        style={{ color: "var(--menu-green)", textDecoration: "underline" }}
                      >
                        Unirse a la reunión
                      </a>
                    </div>
                  )}
                </div>

                {meetingDetail.responsible && (
                  <div className="project-modal-section">
                    <h4 className="project-modal-section-title">Responsable</h4>
                    <p className="project-modal-description">{meetingDetail.responsible}</p>
                  </div>
                )}
              </div>

              <div className="project-modal-footer">
                <button
                  className="btn btn-primary-green"
                  onClick={() => {
                    setEditingEventId(meetingDetail.id);
                    setForm({
                      id_proyecto: meetingDetail.id_proyecto || "",
                      title: meetingDetail.title || "",
                      desc: meetingDetail.desc || "",
                      date: formatDateForInput(meetingDetail.date),
                      time: meetingDetail.time || "",
                      room: meetingDetail.room || "",
                      link: meetingDetail.link || "",
                      startTime: meetingDetail.startTime || "",
                      endTime: meetingDetail.endTime || "",
                      sprint: meetingDetail.sprint || "",
                      sprintId: meetingDetail.sprintId || null,
                      sprintStatus: meetingDetail.sprintStatus || "",
                      meetingType: meetingDetail.meetingType || "Daily Standup",
                      priority: meetingDetail.prioridad || "estandar",
                      duration: meetingDetail.duration || "60",
                      noSprint: !meetingDetail.sprint,
                    });
                    setMeetingDetail(null);
                    setShowModal(true);
                  }}
                >
                  <i className="bx bx-edit"></i> Editar reunión
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setMeetingDetail(null)}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {deleteNotice && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1400 }}>
          <div
            style={{
              background: "#e6f7ee",
              color: "#0b6623",
              padding: "8px 12px",
              borderRadius: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            {deleteNotice}
          </div>
        </div>
      )}
    </div>
  );
}
