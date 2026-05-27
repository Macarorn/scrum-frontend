import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/landing.css";

const ScrumGuide = () => {
  const roles = [
    {
      title: "Product Owner",
      icon: "bx bxs-user-badge",
      desc: "Define la vision del producto, ordena el Product Backlog y prioriza lo que entrega mas valor.",
    },
    {
      title: "Scrum Master",
      icon: "bx bx-command",
      desc: "Facilita Scrum, ayuda al equipo a mejorar y elimina impedimentos que bloquean el avance.",
    },
    {
      title: "Dev Team",
      icon: "bx bx-code-alt",
      desc: "Construye el incremento del producto, estima el trabajo y decide como convertir las ideas en entregables.",
    },
  ];

  const ceremonies = [
    {
      title: "Sprint Planning",
      icon: "bx bx-map-alt",
      desc: "El equipo define el objetivo del Sprint y selecciona las historias que puede completar.",
    },
    {
      title: "Daily Standup",
      icon: "bx bx-timer",
      desc: "Reunion breve para sincronizar avances, bloqueos y proximos pasos del dia.",
    },
    {
      title: "Sprint Review",
      icon: "bx bx-show",
      desc: "Se presenta el incremento terminado y se recibe retroalimentacion de usuarios o interesados.",
    },
    {
      title: "Retrospectiva",
      icon: "bx bx-refresh",
      desc: "El equipo revisa como trabajo y acuerda mejoras concretas para el siguiente Sprint.",
    },
  ];

  const flowSteps = [
    {
      title: "Product Backlog",
      icon: "bx bx-list-ul",
      desc: "Es la única fuente de requisitos para cualquier cambio a realizarse en el producto. El Product Owner es responsable de mantenerlo ordenado y priorizado.",
      details: ["Priorización por valor", "Refinamiento constante", "Estimación de esfuerzo"]
    },
    {
      title: "Sprint Planning",
      icon: "bx bx-calendar-event",
      desc: "El equipo completo colabora para entender el trabajo del Sprint. Se define la meta y se seleccionan los elementos que se transformarán en un incremento usable.",
      details: ["Definición de Meta (Sprint Goal)", "Selección de items", "Plan técnico de ejecución"]
    },
    {
      title: "Sprint",
      icon: "bx bx-infinite",
      desc: "Es el corazón de Scrum. Durante este periodo (1-4 semanas) el equipo desarrolla, prueba e integra el trabajo para alcanzar el objetivo sin interrupciones.",
      details: ["Desarrollo enfocado", "Daily Scrums diarios", "Calidad técnica total"]
    },
    {
      title: "Sprint Review",
      icon: "bx bx-show-alt",
      desc: "Se inspecciona el resultado con los interesados. No es solo una demo, es una sesión de feedback para adaptar el producto a las necesidades reales del mercado.",
      details: ["Demostración de valor", "Feedback de usuarios", "Ajuste del Backlog"]
    },
    {
      title: "Retrospectiva",
      icon: "bx bx-medal",
      desc: "El equipo se inspecciona a sí mismo para mejorar su forma de trabajo. Es el motor de la mejora continua donde se acuerdan cambios concretos para el próximo ciclo.",
      details: ["Análisis de procesos", "Plan de mejoras", "Fortalecimiento del equipo"]
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="scrum-guide-page">
      <section className="scrum-guide-hero">
        <div className="animate-fade-up">
          <span className="lp-tagline">Guia rapida de Scrum</span>
          <h1 className="lp-title">Como funciona Scrum</h1>
          <p className="lp-description">
            Scrum es un marco de trabajo agil que ayuda a personas, equipos y organizacione
            para crear productos complejos mediante entregas pequeñas, inspeccion frecuente y
             mejora continua. Ayuda a que el equipo se enfoque en valor real, no solo en tareas.
          </p>
          <div className="scrum-guide-actions">
            <a href="#roles" className="lp-btn-secondary">
              Roles
            </a>
            <a href="#ceremonias" className="lp-btn-secondary">
              Eventos
            </a>
            <a href="#sprints" className="lp-btn-secondary">
              Sprints
            </a>
            <a href="#flujo" className="lp-btn-secondary">
              Flujo del trabajo
            </a>
            <Link to="/" className="lp-btn-primary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>

      <section className="scrum-guide-section" id="roles">
        <div className="scrum-guide-section-header">
          <span className="lp-tagline">Equipo Scrum</span>
          <h2>Roles principales</h2>
        </div>

        <div className="scrum-roles-modern">
          {roles.map((role, idx) => (
            <div className={`scrum-role-card animate-fade-up delay-${(idx + 1) * 100}`} key={role.title}>
              <div className="role-icon-wrapper">
                <i className={role.icon}></i>
              </div>
              <div className="role-text">
                <h3>{role.title}</h3>
                <p>{role.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="scrum-guide-section" id="ceremonias">
        <div className="scrum-guide-section-header">
          <span className="lp-tagline">Eventos Scrum</span>
          <h2>Reuniones de seguimiento</h2>
          <p>
            Scrum se basa en eventos de trabajo que ayudan al equipo a organizarse, 
            revisar avances y mejorar continuamente.
          </p>
        </div>

        <div className="scrum-process-flow">
          {ceremonies.map((ceremony, index) => (
            <div className={`scrum-process-step animate-fade-up delay-${(index + 1) * 100}`} key={ceremony.title}>
              <div className="step-number">{index + 1}</div>
              <div className="step-card">
                <div className="step-icon"><i className={ceremony.icon}></i></div>
                <h3>{ceremony.title}</h3>
                <p>{ceremony.desc}</p>
              </div>
              {index < ceremonies.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      <section className="scrum-guide-section" id="sprints">
        <div className="scrum-guide-section-header">
          <span className="lp-tagline">Ciclo de trabajo</span>
          <h2>Sprints</h2>
          <p>
            Un Sprint es un ciclo de trabajo que permite al equipo mantener un ritmo constante. 
            Durante este periodo, el equipo se compromete a alcanzar un objetivo específico, 
            asegurando que cada esfuerzo realizado se traduzca en una entrega de valor
          </p>
        </div>

        <div className="scrum-pillars-grid">
          <div className="scrum-pillar animate-fade-up delay-100">
            <div className="pillar-header">
              <i className="bx bx-calendar"></i>
              <h3>Duración fija</h3>
            </div>
            <p>Sprints de 1-4 semanas que crean un ritmo predecible y saludable para el equipo.</p>
          </div>

          <div className="scrum-pillar animate-fade-up delay-200">
            <div className="pillar-header">
              <i className="bx bx-target-lock"></i>
              <h3>Objetivos Claros</h3>
            </div>
            <p>Cada ciclo tiene una meta única que alinea todos los esfuerzos hacia el éxito.</p>
          </div>

          <div className="scrum-pillar animate-fade-up delay-300">
            <div className="pillar-header">
              <i className="bx bx-package"></i>
              <h3>Valor Real</h3>
            </div>
            <p>No solo tareas; entregamos incrementos de producto que funcionan de verdad.</p>
          </div>

          <div className="scrum-pillar animate-fade-up delay-400">
            <div className="pillar-header">
              <i className="bx bx-shield-quarter"></i>
              <h3>Foco Total</h3>
            </div>
            <p>Protegemos al equipo de interrupciones para garantizar calidad y cumplimiento.</p>
          </div>
        </div>
      </section>

      <section className="scrum-guide-section" id="flujo">
        <div className="scrum-guide-section-header">
          <span className="lp-tagline">Ejemplo interactivo</span>
          <h2>Flujo basico del ciclo de desarrollo</h2>
          <p>
            Haz clic en cada paso para ver que ocurre dentro de un ciclo Scrum.
          </p>
        </div>

        <div className="scrum-flow-board">
          <div className="scrum-flow-steps" role="tablist" aria-label="Flujo Scrum">
            {flowSteps.map((step, index) => (
              <button
                className={`scrum-flow-step ${
                  activeStep === index ? "is-active" : ""
                }`}
                key={step.title}
                onClick={() => setActiveStep(index)}
                type="button"
              >
                <span>{index + 1}</span>
                {step.title}
              </button>
            ))}
          </div>

          <article className="scrum-flow-detail-premium">
            <div className="detail-header-row">
              <div className="detail-tag">PASO {activeStep + 1}</div>
            </div>
            
            <div className="detail-info-full">
              <h3>{flowSteps[activeStep].title}</h3>
              <p>{flowSteps[activeStep].desc}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="scrum-guide-section scrum-guide-final">
        <h2>Listo para aplicar Scrum</h2>
        <p>
          Empieza con un backlog pequeno, define un objetivo claro y revisa el
          avance con tu equipo en cada Sprint.
        </p>
        <div className="scrum-guide-actions">
          <Link to="/register" className="lp-btn-primary">
            Empezar con ScrumTrack
          </Link>
          <Link to="/" className="lp-btn-secondary">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ScrumGuide;
