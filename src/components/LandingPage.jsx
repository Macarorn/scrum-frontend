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

  //  NUEVO (no afecta nada existente)
  const [activeCard, setActiveCard] = useState(null);

  const tabs = [
    {
      name: "Paneles",
      title: "Paneles",
      desc: "Los tableros de scrum ayudan a los equipos ágiles a dividir proyectos grandes y complejos en trabajos gestionables para que los equipos concentrados, que trabajan en sprints, lancen más rápido.",
      img: "/imagenes/panel.png",
    },
    {
      name: "Backlogs",
      title: "Backlogs",
      desc: "En el backlog de scrum, puedes organizar tus sprints, rellenarlos con incidencias de diferentes tipos y, a continuación, estimarlas y priorizarlas.",
      img: "/imagenes/backlog.png",
    },
    {
      name: "Calendarios",
      title: "Calendarios",
      desc: "Organiza tu ritmo de trabajo con calendarios compartidos, estableciendo fechas para eventos de Scrum, hitos del equipo y periodos de Sprint. Los calendarios mantienen la visibilidad de la cadencia de entrega y aseguran que todos los involucrados sepan exactamente cuándo ocurren las inspecciones y adaptaciones.",
      img: "/imagenes/calendarios.png",
    },
    {
      name: "Metricas",
      title: "Metricas",
      desc: "Visualiza el progreso real con informes detallados, analizando métricas de velocidad, diagramas de flujo y el cumplimiento de objetivos por Sprint. Los informes transforman los datos en transparencia, permitiendo que el equipo y los interesados tomen decisiones informadas para mejorar el rendimiento y la calidad.",
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
      <section className="lp-hero">
        <div className="lp-hero-text">
          <span className="lp-tagline">Colabora mejor, entrega más rápido</span>

          <h1 className="lp-title">Organiza tu equipo con Scrum.</h1>

          <p className="lp-description">
            Flexibilidad, aprendizaje, innovación y colaboración con los
            aprendices del Sena.
          </p>

          <div className="lp-hero-actions">
            <Link to="/register" className="lp-btn-primary">
              Empieza
            </Link>

            <Link to="/scrum-guide" className="lp-btn-secondary">
              &iquest;C&oacute;mo funciona Scrum?
            </Link>
          </div>
        </div>

        <div className="lp-hero-image">
          <img src="/imagenes/image1.png" alt="Scrum illustration" />
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="lp-features">
        <div className="lp-features-header">
          <p className="lp-sub-tagline">Menos reuniones, más soluciones.</p>

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
              title: "Eficiencia",
              desc: "Optimiza procesos y tiempos para lograr más resultados con menos esfuerzo.",
              img: "/imagenes/image3.png",
            },
            {
              title: "Trabajo en equipo",
              desc: "Colabora, comunica y avanza junto a tu equipo hacia objetivos comunes.",
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
          ¿Qué es una plantilla de scrum?
        </h2>

        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                margin: "0 8px",
                padding: "10px 20px",
                borderRadius: "20px",
                border:
                  activeTab === i ? "2px solid #39a900" : "1px solid #d8e2e8",
                background: activeTab === i ? "#eef8e5" : "#f5f8f3",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
            flexWrap: "wrap",
          }}
        >
          <img
            src={tabs[activeTab].img}
            alt=""
            style={{
              width: "500px",
              maxWidth: "100%",
              borderRadius: "12px",
            }}
          />

          <div style={{ maxWidth: "400px" }}>
            <h3>{tabs[activeTab].title}</h3>
            <p>{tabs[activeTab].desc}</p>
          </div>
        </div>
      </section>

      {/* --- CARRUSEL --- */}
      <section className="lp-carousel-section">
        <h2 className="lp-carousel-title">
          ¿Como Funciona Scrum?
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
                <p>{item.desc}</p>
              </div>
            ))}
            </div>
        </div>

        {/* NUEVO: tarjeta expandida */}
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
              onClick={()=> setActiveCard(null)}
              >
                X 
              </button>
              <h3>{activeCard.title}</h3>
              <p>{activeCard.desc}</p>
              {/*  contenido extra opcional */}
              {activeCard.extra && (
                <div className="lp-carousel-extra">
                  <p>{activeCard.extra}</p>
                </div>
              )} 
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
              <li>WhatsApp Tarjeta Cencosud</li>
              <li>Política de Tratamiento de Datos</li>
              <li>Datos Personales Puntos</li>
              <li>Autorización E-commerce</li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h4>Nosotros</h4>
            <ul>
              <li>Cencosud</li>
              <li>Responsabilidad Social</li>
              <li>Trabaja con Nosotros</li>
              <li>Proveedores</li>
              <li>Código de ética</li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h4>Contáctanos</h4>
            <ul>
              <li>+57 123456789</li>
              <li>Scrum.wed@gmail.com</li>
              <li>Ext: 2585-125-369</li>
            </ul>
          </div>

          <div className="lp-footer-col">
            <h4>Redes sociales</h4>

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
