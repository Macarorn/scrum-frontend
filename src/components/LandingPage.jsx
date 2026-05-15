import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaXTwitter,
  FaTiktok,
} from "react-icons/fa6";
import {
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiFlag,
  FiLayers,
  FiMessageCircle,
  FiRefreshCcw,
  FiShield,
  FiTarget,
  FiUsers,
} from "react-icons/fi";
import "../assets/stylos-landing.css";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [activeCard, setActiveCard] = useState(null);

  const tabs = [
    {
      name: "Tableros de Sprint",
      title: "Tableros de Sprint Dinámicos",
      desc: "Visualiza el flujo de trabajo de tu equipo en tiempo real. Organiza tareas, asigna responsables y mueve tarjetas entre estados para mantener un ritmo constante en cada Sprint.",
      img: "/imagenes/landing-1.png",
    },
    {
      name: "Gestión del Backlog",
      title: "Gestión Eficiente del Backlog",
      desc: "Prioriza tus historias de usuario, estima puntos de esfuerzo y organiza tu Product Backlog con una interfaz intuitiva diseñada para maximizar el valor de entrega.",
      img: "/imagenes/foto.png",
    },
    {
      name: "Centro de Equipo",
      title: "Colaboración y Sincronización",
      desc: "Facilita la comunicación entre el Product Owner, Scrum Master y el equipo de desarrollo. Mantén a todos alineados con los objetivos del producto y los incrementos de valor.",
      img: "/imagenes/landing-3.png",
    },
    {
      name: "Métricas de Valor",
      title: "Análisis y Mejora Continua",
      desc: "Toma decisiones basadas en datos reales. Analiza la velocidad del equipo, visualiza el progreso del sprint y mejora tus procesos a través de métricas claras y accionables.",
      img: "/imagenes/landing-4.png",
    },
  ];

  const carouselItems = [
    {
      title: "¿Qué es Scrum?",
      desc: "Scrum es un marco de trabajo ágil que ayuda a los equipos a desarrollar productos complejos de manera incremental. Se basa en la colaboración, la inspección constante y la adaptación para entregar valor de forma continua.",
    },
    {
      title: "Roles en Scrum",
      desc: "Scrum define tres roles clave: el Product Owner, responsable de maximizar el valor del producto; el Scrum Master, quien facilita el proceso y elimina impedimentos; y el equipo de desarrollo, que construye el producto de forma colaborativa.",
    },
    {
      title: "Sprints",
      desc: "El trabajo se organiza en ciclos llamados Sprints, que tienen una duración fija. En cada Sprint se construye un incremento del producto listo para ser utilizado, permitiendo entregas frecuentes y mejora continua.",
    },
    {
      title: "Eventos Scrum",
      desc: "Scrum incluye eventos que estructuran el trabajo: Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective. Estos eventos permiten planificar, sincronizar, evaluar resultados y mejorar el proceso.",
    },
    {
      title: "Artefactos Scrum",
      desc: "Los artefactos principales son el Product Backlog, Sprint Backlog y el Incremento. Estos proporcionan transparencia sobre el trabajo, el progreso y el valor entregado en cada Sprint.",
    },
    {
      title: "Mejora continua",
      desc: "Scrum promueve la mejora continua a través de la inspección y adaptación. Los equipos reflexionan regularmente sobre su trabajo y ajustan su forma de trabajar para ser más eficientes y efectivos.",
    },
  ];

  const doubled = [...carouselItems, ...carouselItems];

  const roleCards = [
    {
      title: "Product Owner",
      desc: "Define la visión, prioriza el backlog y asegura que el equipo entregue el mayor valor.",
      icon: <FiTarget />,
    },
    {
      title: "Scrum Master",
      desc: "Facilita el proceso, elimina bloqueos y protege el foco del equipo en el sprint.",
      icon: <FiShield />,
    },
    {
      title: "Equipo de desarrollo",
      desc: "Diseña, construye y entrega incrementos funcionales con autonomía y colaboración.",
      icon: <FiUsers />,
    },
  ];

  const flowSteps = [
    {
      title: "Sprint Planning",
      desc: "Define objetivos del sprint, alcance y compromiso del equipo.",
      icon: <FiCalendar />,
    },
    {
      title: "Daily Scrum",
      desc: "Sincroniza avances, bloqueos y ajustes diarios en 15 minutos.",
      icon: <FiMessageCircle />,
    },
    {
      title: "Sprint Review",
      desc: "Presenta el incremento y recoge feedback de los interesados.",
      icon: <FiCheckCircle />,
    },
    {
      title: "Retrospective",
      desc: "Identifica mejoras y compromisos para el siguiente sprint.",
      icon: <FiRefreshCcw />,
    },
  ];

  const artifactCards = [
    {
      title: "Product Backlog",
      desc: "Lista priorizada de necesidades del producto con enfoque en valor.",
      icon: <FiClipboard />,
    },
    {
      title: "Sprint Backlog",
      desc: "Compromiso del equipo para cumplir el objetivo del sprint.",
      icon: <FiLayers />,
    },
    {
      title: "Incremento",
      desc: "Resultado utilizable, listo para entregar valor al final del sprint.",
      icon: <FiCheckCircle />,
    },
    {
      title: "Definition of Done",
      desc: "Criterios claros para garantizar calidad y consistencia.",
      icon: <FiFlag />,
    },
  ];

  const scrumGallery = [
    {
      title: "Sprint Planning",
      desc: "Planifica el sprint con el equipo y define el objetivo principal.",
      img: "/imagenes/image-1778544885602.png",
    },
    {
      title: "Daily Scrum",
      desc: "Ritmo diario para detectar bloqueos y ajustar el plan.",
      img: "/imagenes/imaget.png",
    },
    {
      title: "Calendario de sprint",
      desc: "Visualiza entregas, hitos y reuniones del sprint en una sola vista.",
      img: "/imagenes/landing-3.png",
    },
  ];

  return (
    <div className="lp-container">
      {/* --- HERO --- */}
      <section className="lp-hero relative-hero">
        <div className="lp-background-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>

        <div className="lp-hero-text">
          <span className="lp-tagline">Colabora mejor, entrega más rápido</span>

          <h1 className="lp-title animate-fade-up delay-100">Organiza tu equipo con Scrum.</h1>

          <p className="lp-description animate-fade-up delay-200">
            Flexibilidad, aprendizaje, innovación y colaboración con los
            aprendices del Sena. Eleva la productividad de tus proyectos hoy mismo.
          </p>

          <div className="lp-hero-actions">
            <Link to="/register" className="lp-btn-primary">
              Empieza
            </Link>

            <Link to="/scrum-guide" className="lp-btn-secondary">
              Guía Interactiva Scrum
            </Link>
          </div>
        </div>

        <div className="lp-hero-image animate-fade-up delay-400">
          <img src="/imagenes/image1.png" alt="Scrum illustration" />
        </div>

        {/* Onda decorativa */}
        <div className="lp-wave">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,115.15,193.39,97.8,239.5,85.06,281.33,70.18,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      <section className="lp-section lp-roles-section">
        <div className="lp-section-header">
          <p className="lp-section-kicker">Roles Scrum</p>
          <h2 className="lp-section-title">Un equipo que se complementa con claridad.</h2>
          <p className="lp-section-lead">
            Asigna responsabilidades, alinea prioridades y elimina la confusion en cada sprint.
          </p>
        </div>

        <div className="scrum-roles-modern">
          {roleCards.map((role, i) => (
            <article
              className="scrum-role-card lp-reveal"
              key={role.title}
              style={{ "--delay": `${i * 140}ms` }}
            >
              <span className="role-icon-wrapper">{role.icon}</span>
              <div>
                <h3>{role.title}</h3>
                <p>{role.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section lp-gallery-section">
        <div className="lp-section-header">
          <p className="lp-section-kicker">Scrum en acción</p>
          <h2 className="lp-section-title">Rituales visuales para equipos sincronizados.</h2>
          <p className="lp-section-lead">
            Referencias visuales que conectan eventos, trabajo en equipo y valor entregado.
          </p>
        </div>

        <div className="lp-media-grid">
          {scrumGallery.map((item, i) => (
            <article
              className="lp-media-card lp-reveal"
              key={item.title}
              style={{ "--delay": `${i * 140}ms` }}
            >
              <img src={item.img} alt={item.title} />
              <div className="lp-media-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section lp-flow-section">
        <div className="lp-section-header">
          <p className="lp-section-kicker">Eventos del sprint</p>
          <h2 className="lp-section-title">Un flujo claro para entregar valor continuo.</h2>
          <p className="lp-section-lead">
            Sigue el paso a paso del sprint y mantente en mejora constante.
          </p>
        </div>

        <div className="scrum-process-flow">
          {flowSteps.map((step, i) => (
            <div className="scrum-process-step" key={step.title}>
              <span className="step-number">0{i + 1}</span>
              {i < flowSteps.length - 1 && <span className="step-connector" aria-hidden="true"></span>}
              <div className="step-card lp-reveal" style={{ "--delay": `${i * 160}ms` }}>
                <span className="step-icon">{step.icon}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* --- FEATURES --- */}
      <section className="lp-features lp-section">
        <div className="lp-features-header">
          <p className="lp-sub-tagline">Menos reuniones, más soluciones</p>

          <h2 className="lp-sub-title">
            Lleva tu proyecto al siguiente nivel, de forma rápida y eficiente.
          </h2>
        </div>

        <div className="lp-features-grid">
          {[
            {
              title: "Mayor organización",
              desc: "Organiza tareas, proyectos y equipos de manera estructurada y eficiente.",
              icon: <FiLayers style={{ fontSize: "32px", color: "#64748b" }} />, /* Slate */
            },
            {
              title: "Máxima Eficiencia",
              desc: "Optimiza procesos y tiempos para lograr más resultados con menos esfuerzo.",
              icon: <FiTarget style={{ fontSize: "32px", color: "#84cc16" }} />, /* Sage/Lime pastel */
            },
            {
              title: "Trabajo en equipo",
              desc: "Colabora, comunica y avanza junto a tu equipo hacia objetivos comunes sin fricciones.",
              icon: <FiUsers style={{ fontSize: "32px", color: "#d97706" }} />, /* Amber/Gold suave */
            },
          ].map((item, i) => (
            <div className="lp-feature-card" key={i}>
              <div className="lp-icon-wrapper">
                {item.icon}
              </div>

              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-section lp-artifacts-section">
        <div className="lp-section-header">
          <p className="lp-section-kicker">Artefactos clave</p>
          <h2 className="lp-section-title">Transparencia total en el trabajo del equipo.</h2>
          <p className="lp-section-lead">
            Gestiona prioridades, mantiene consistencia y muestra progreso real.
          </p>
        </div>

        <div className="scrum-pillars-grid">
          {artifactCards.map((item, i) => (
            <article
              className="scrum-pillar lp-reveal"
              key={item.title}
              style={{ "--delay": `${i * 140}ms` }}
            >
              <div className="pillar-header">
                <span className="pillar-icon">{item.icon}</span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --- NUEVA SECCIÓN TABS  --- */}
      <section className="lp-final-image-section lp-section">
        <h2 className="lp-tabs-title">Todo lo que necesitas para dominar Scrum</h2>

        <div className="lp-tabs-controls">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={activeTab === i ? "active" : ""}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="lp-tabs-content">
          <div className="lp-tabs-image" key={`img-${activeTab}`}>
            <img src={tabs[activeTab].img} alt={tabs[activeTab].title} />
          </div>

          <div className="lp-tabs-text" key={`text-${activeTab}`}>
            <h3>{tabs[activeTab].title}</h3>
            <p>{tabs[activeTab].desc}</p>
            <Link to="/register" className="lp-btn-primary lp-tabs-cta">
              Explorar Función
            </Link>
          </div>
        </div>
      </section>

      {/* --- CARRUSEL --- */}
      <section className="lp-carousel-section">
        <h2 className="lp-carousel-title">
          ¿Cómo Funciona Scrum?
        </h2>

        <div className="lp-carousel-track-wrapper">
          <div className="lp-carousel-track">
            {doubled.map((item, i) => (
              <div
                className="lp-carousel-card"
                key={i}
              >
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal expandido */}
        {activeCard && (
          <div
            className="lp-carousel-overlay"
            onClick={() => setActiveCard(null)}
          >
            <div
              className="lp-carousel-expanded"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="lp-carousel-close"
                onClick={() => setActiveCard(null)}
              >
                ✕
              </button>
              <h3>{activeCard.title}</h3>
              <p>{activeCard.desc}</p>
            </div>
          </div>
        )}
      </section>

      {/* --- FAQ --- */}
      <section className="lp-faq-section">
        <div className="lp-faq-grid">
          <div className="lp-faq-header">
            <h2>Preguntas frecuentes.</h2>
            <p>Todo lo que necesitas saber sobre ScrumTrack y cómo puede ayudar a tu equipo.</p>
            <img 
              src="/imagenes/faq-illustration.png" 
              alt="FAQ illustration" 
              className="lp-faq-image"
            />
          </div>

          <div className="lp-faq-list">
            {[
              { q: "¿Qué es ScrumTrack?", a: "ScrumTrack es una plataforma web diseñada para gestionar proyectos ágiles con Scrum. Te permite crear sprints, historias de usuario, tareas y colaborar con tu equipo en tiempo real." },
              { q: "¿Es gratuito usar ScrumTrack?", a: "Sí, ScrumTrack es completamente gratuito. Fue creado como un proyecto educativo para aprendices del SENA que quieren aplicar metodologías ágiles en sus proyectos." },
              { q: "¿Cómo creo un proyecto nuevo?", a: "Después de registrarte e iniciar sesión, serás redirigido a la pantalla de crear proyecto donde podrás definir el nombre, tipo y descripción de tu proyecto." },
              { q: "¿Puedo invitar a otros miembros a mi proyecto?", a: "Sí, puedes agregar miembros a tu proyecto asignándoles roles como Product Owner, Scrum Master o Desarrollador dentro de la configuración del proyecto." },
              { q: "¿ScrumTrack incluye tableros Kanban?", a: "Sí, cada sprint cuenta con un tablero Kanban visual donde puedes mover tareas entre las columnas To Do, In Progress y Done para visualizar el flujo de trabajo." },
            ].map((item, i) => (
              <div
                className={`lp-faq-item ${item._open ? "is-open" : ""}`}
                key={i}
                onClick={(e) => {
                  const el = e.currentTarget;
                  el.classList.toggle("is-open");
                }}
              >
                <button className="lp-faq-question">
                  {item.q}
                  <span className="lp-faq-icon">+</span>
                </button>
                <div className="lp-faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="lp-cta-section">
        <div className="lp-cta-banner">
          <div className="lp-cta-text">
            <h2>Empieza a gestionar tus proyectos con ScrumTrack.</h2>
            <p>Regístrate gratis y lleva tus proyectos ágiles al siguiente nivel. Sin tarjeta de crédito, sin complicaciones.</p>
          </div>
          <div className="lp-cta-actions">
            <Link to="/register" className="lp-cta-btn-primary">
              Crear cuenta gratis
            </Link>
            <Link to="/scrum-guide" className="lp-cta-btn-outline">
              Ver la guía
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="lp-footer">
        <div className="lp-footer-container">
          <div className="lp-footer-col">
            <h4>Atención al cliente</h4>
            <ul>
              <li>PQR</li>
              <li>Preguntas Frecuentes</li>
              <li>Política de Cookies</li>
              <li>Términos y Condiciones</li>
              <li>Política de Tratamiento de Datos</li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h4>Nosotros</h4>
            <ul>
              <li>El Equipo</li>
              <li>Responsabilidad Social</li>
              <li>Trabaja con Nosotros</li>
              <li>Código de ética</li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h4>Contáctanos</h4>
            <ul>
              <li>+57 123456789</li>
              <li>soporte@scrumtrack.com</li>
              <li>Ext: 2585-125-369</li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h4>Síguenos en Redes</h4>
            <div className="lp-social-icons">
              <FaInstagram />
              <FaWhatsapp />
              <FaFacebookF />
              <FaXTwitter />
              <FaTiktok />
            </div>

            <div className="lp-sena-logo">
              <img src="/imagenes/sena-logo.png" alt="SENA Logo" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
