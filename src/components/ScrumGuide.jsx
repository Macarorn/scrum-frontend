import { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/stylos-landing.css";

const ScrumGuide = () => {
  const roles = [
    {
      title: "Product Owner",
      desc: "Define la vision del producto, ordena el Product Backlog y prioriza lo que entrega mas valor.",
    },
    {
      title: "Scrum Master",
      desc: "Facilita Scrum, ayuda al equipo a mejorar y elimina impedimentos que bloquean el avance.",
    },
    {
      title: "Dev Team",
      desc: "Construye el incremento del producto, estima el trabajo y decide como convertir las ideas en entregables.",
    },
  ];

  const ceremonies = [
    {
      title: "Sprint Planning",
      desc: "El equipo define el objetivo del Sprint y selecciona las historias que puede completar.",
    },
    {
      title: "Daily Standup",
      desc: "Reunion breve para sincronizar avances, bloqueos y proximos pasos del dia.",
    },
    {
      title: "Sprint Review",
      desc: "Se presenta el incremento terminado y se recibe retroalimentacion de usuarios o interesados.",
    },
    {
      title: "Retrospectiva",
      desc: "El equipo revisa como trabajo y acuerda mejoras concretas para el siguiente Sprint.",
    },
  ];

  const flowSteps = [
    {
      title: "Product Backlog",
      desc: "Lista priorizada de necesidades, mejoras e ideas del producto.",
    },
    {
      title: "Sprint Planning",
      desc: "Se elige que trabajo entra al Sprint y cual sera el objetivo.",
    },
    {
      title: "Sprint",
      desc: "El equipo desarrolla, prueba y ajusta durante un ciclo corto.",
    },
    {
      title: "Review",
      desc: "Se inspecciona el resultado con interesados y usuarios.",
    },
    {
      title: "Retrospectiva",
      desc: "Se mejora la forma de trabajo antes de iniciar el siguiente ciclo.",
    },
  ];

  const [activeStep, setActiveStep] = useState(0);

  return (
    <main className="scrum-guide-page">
      <section className="scrum-guide-hero">
        <div>
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

        <div className="scrum-guide-grid">
          {roles.map((role, index) => (
            <article className="scrum-guide-card" key={role.title}>
              <span>{index + 1}</span>
              <h3>{role.title}</h3>
              <p>{role.desc}</p>
            </article>
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

        <div className="scrum-guide-grid scrum-guide-grid-wide">
          {ceremonies.map((ceremony, index) => (
            <article className="scrum-guide-card" key={ceremony.title}>
              <span>{index + 1}</span>
              <h3>{ceremony.title}</h3>
              <p>{ceremony.desc}</p>
            </article>
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

        <div className="scrum-guide-grid scrum-guide-grid-wide">
          <article className="scrum-guide-card">
            <span>1</span>
            <h3>Duración fija</h3>
            <p>
              Es un ciclo corto de trabajo, normalmente de una a cuatro
              semanas. Al final debe existir un incremento usable del producto.
            </p>
          </article>

          <article className="scrum-guide-card">
            <span>2</span>
            <h3>Objetivos</h3>
            <p>
              Cada Sprint tiene una meta clara que guía el trabajo del equipo, 
              funcionando como un objetivo estratégico que da sentido a cada tarea diaria y 
              asegura el éxito de esas semanas de trabajo.
            </p>
          </article>
          <article className="scrum-guide-card">
            <span>3</span>
            <h3>Incremento del producto</h3>
            <p>
              Al final de cada ciclo, se entrega una versión funcional o mejorada del producto,
              lo que permite que el cliente reciba valor real de forma constante sin tener que 
              esperar a que el proyecto esté terminado por completo.
            </p>
          </article>
          <article className="scrum-guide-card">
            <span>4</span>
            <h3>Enfoque y estabilidad</h3>
            <p>
            Durante el Sprint no se deben hacer cambios que afecten el objetivo, 
            ya que esto protege el enfoque del equipo y garantiza que el compromiso adquirido
            se cumpla sin distracciones ni interrupciones.
            </p>
          </article>
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

          <article className="scrum-flow-detail">
            <span>Paso {activeStep + 1}</span>
            <h3>{flowSteps[activeStep].title}</h3>
            <p>{flowSteps[activeStep].desc}</p>
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
