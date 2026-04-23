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
      name: "Informes",
      title: "Informes",
      desc: "Visualiza el progreso real con informes detallados, analizando métricas de velocidad, diagramas de flujo y el cumplimiento de objetivos por Sprint. Los informes transforman los datos en transparencia, permitiendo que el equipo y los interesados tomen decisiones informadas para mejorar el rendimiento y la calidad.",
      img: "/imagenes/metricas.png",
    },
  ];

  const carouselItems = [
    { title: " Gestión de tareas", desc: "Organiza tareas por sprint, asigna responsables y sigue el progreso en tiempo real." },
    { title: " Seguimiento de progreso", desc: "Visualiza el avance del proyecto con dashboards claros y fáciles de entender." },
    { title: "Trabajo en equipo", desc: "Mejora la comunicación entre integrantes del equipo en un solo lugar." },
    { title: "Entregas rápidas", desc: "Optimiza tiempos de desarrollo con metodología Scrum bien aplicada." },
  ];

  const doubled = [...carouselItems, ...carouselItems];

  return (
    <div className="lp-container">

      {/* --- HERO --- */}
      <section className="lp-hero">
        <div className="lp-hero-text">
          <span className="lp-tagline">
            Colabora mejor, entrega más rápido
          </span>

          <h1 className="lp-title">
            Organiza tu equipo con Scrum.
          </h1>

          <p className="lp-description">
            Flexibilidad, aprendizaje, innovación y colaboración con los aprendices del Sena.
          </p>

          <Link to="/register" className="lp-btn-primary">
            Empieza
          </Link>
        </div>

        <div className="lp-hero-image">
          <img src="/imagenes/image1.png" alt="Scrum illustration" />
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="lp-features">
        <div className="lp-features-header">
          <p className="lp-sub-tagline">
            Menos reuniones, más soluciones.
          </p>

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

              <div className="lp-feature-btn">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- NUEVA SECCIÓN TABS  --- */}
      <section className="lp-final-image-section">

        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
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
                border: activeTab === i ? "2px solid #3b82f6" : "none",
                background: "#e5e7eb",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap"
        }}>

          <img
            src={tabs[activeTab].img}
            alt=""
            style={{
              width: "500px",
              maxWidth: "100%",
              borderRadius: "12px"
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
          Explora cómo ScrumMas mejora tu equipo
        </h2>

        <div className="lp-carousel-track-wrapper">
          <div className="lp-carousel-track">
            {doubled.map((item, i) => (
              <div className="lp-carousel-card" key={i}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
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