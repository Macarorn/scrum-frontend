import React from "react";
import { Link } from "react-router-dom";
import "../assets/stylos-landing.css";

const LandingPage = () => {

  const carouselItems = [
    { title: " Gestión de tareas", desc: "Organiza tareas por sprint, asigna responsables y sigue el progreso en tiempo real." },
    { title: " Seguimiento de progreso", desc: "Visualiza el avance del proyecto con dashboards claros y fáciles de entender." },
    { title: "Trabajo en equipo", desc: "Mejora la comunicación entre integrantes del equipo en un solo lugar." },
    { title: "Entregas rápidas", desc: "Optimiza tiempos de desarrollo con metodología Scrum bien aplicada." },
  ];

  const doubled = [...carouselItems, ...carouselItems];

  return (
    <div className="lp-container">

      {/* --- HEADER --- */}
      <header className="lp-header">
        <div className="lp-logo">
          scrum<span className="lp-logo-accent">Mas</span>
        </div>

        <nav className="lp-nav">
          <Link to="/login" className="lp-btn-link">
            Acceder
          </Link>

          <Link to="/register" className="lp-btn-link">
            Regístrate
          </Link>
        </nav>
      </header>

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

        {/* IMAGEN HERO */}
        <div className="lp-hero-image">
          <img
            src="/imagenes/image1.png"
            alt="Scrum illustration"
          />
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

          <div className="lp-feature-card">
            <div className="lp-icon-wrapper">
              <img src="/imagenes/image2.png" alt="Organización" />
            </div>
            <h3>Mayor organización</h3>
          </div>

          <div className="lp-feature-card">
            <div className="lp-icon-wrapper">
              <img src="/imagenes/image3.png" alt="Eficiencia" />
            </div>
            <h3>Eficiencia</h3>
          </div>

          <div className="lp-feature-card">
            <div className="lp-icon-wrapper">
              <img src="/imagenes/image3.png" alt="Trabajo en equipo" />
            </div>
            <h3>Trabajo en equipo</h3>
          </div>

        </div>
      </section>

      {/* --- IMAGEN GRANDE FINAL --- */}
      <section className="lp-final-image-section">
        <img
          src="/imagenes/image4.png"
          alt="Vista general del sistema"
          className="lp-final-image"
        />
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
      
      
      

    </div>
  );
};

export default LandingPage;