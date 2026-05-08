import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaXTwitter,
  FaTiktok,
} from "react-icons/fa6";
import "../assets/stylos-landing.css";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [activeCard, setActiveCard] = useState(null);

  const tabs = [
    {
      name: "Paneles",
      title: "Paneles Visuales",
      desc: "Los tableros de scrum ayudan a los equipos ágiles a dividir proyectos grandes y complejos en trabajos gestionables para que los equipos concentrados, que trabajan en sprints, lancen más rápido.",
      img: "/imagenes/panel.png",
    },
    {
      name: "Backlogs",
      title: "Prioriza tus Backlogs",
      desc: "En el backlog de scrum, puedes organizar tus sprints, rellenarlos con incidencias de diferentes tipos y, a continuación, estimarlas y priorizarlas.",
      img: "/imagenes/backlog.png",
    },
    {
      name: "Calendarios",
      title: "Sincroniza Calendarios",
      desc: "Organiza tu ritmo de trabajo con calendarios compartidos, estableciendo fechas para eventos de Scrum, hitos del equipo y periodos de Sprint. Los calendarios mantienen la visibilidad de la cadencia de entrega.",
      img: "/imagenes/calendarios.png",
    },
    {
      name: "Metricas",
      title: "Analiza Métricas",
      desc: "Visualiza el progreso real con informes detallados, analizando métricas de velocidad, diagramas de flujo y el cumplimiento de objetivos por Sprint.",
      img: "/imagenes/metricas.png",
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
              Empieza Gratis
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



      {/* --- FEATURES --- */}
      <section className="lp-features">
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
              img: "/imagenes/image2.png",
            },
            {
              title: "Máxima Eficiencia",
              desc: "Optimiza procesos y tiempos para lograr más resultados con menos esfuerzo.",
              img: "/imagenes/image3.png",
            },
            {
              title: "Trabajo en equipo",
              desc: "Colabora, comunica y avanza junto a tu equipo hacia objetivos comunes sin fricciones.",
              img: "/imagenes/imagee.png",
            },
          ].map((item, i) => (
            <div className="lp-feature-card" key={i}>
              <div className="lp-icon-wrapper">
                <img src={item.img} alt={item.title} />
              </div>

              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- NUEVA SECCIÓN TABS  --- */}
      <section className="lp-final-image-section">
        <h2 className="lp-tabs-title">
          Descubre el poder de nuestras vistas
        </h2>

        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={activeTab === i ? "active" : ""}
              style={{ margin: "0 8px", marginBottom: "10px" }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="lp-tabs-content">
          <div className="lp-tabs-image">
            <img src={tabs[activeTab].img} alt={tabs[activeTab].title} />
          </div>

          <div className="lp-tabs-text">
            <h3>{tabs[activeTab].title}</h3>
            <p>{tabs[activeTab].desc}</p>
            <Link to="/register" className="lp-btn-primary" style={{ display: "inline-block", marginTop: "24px" }}>
              Ver en Acción
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
                onClick={() => setActiveCard(item)}
              >
                <h3>{item.title}</h3>
                <p>{item.desc.substring(0, 80)}...</p>
                <span style={{ color: "var(--primary)", fontWeight: "600", display: "block", marginTop: "16px" }}>Leer más →</span>
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
