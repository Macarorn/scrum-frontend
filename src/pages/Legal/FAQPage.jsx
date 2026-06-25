import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/legal.css";

const faqs = [
  {
    q: "¿Qué es ScrumTrack?",
    a: "ScrumTrack es una plataforma web diseñada para gestionar proyectos ágiles con Scrum. Te permite crear sprints, historias de usuario, tareas y colaborar con tu equipo en tiempo real.",
  },
  {
    q: "¿Es gratuito usar ScrumTrack?",
    a: "Sí, ScrumTrack es completamente gratuito. Fue creado como un proyecto educativo para aprendices del SENA que quieren aplicar metodologías ágiles en sus proyectos.",
  },
  {
    q: "¿Cómo creo un proyecto nuevo?",
    a: "Después de registrarte e iniciar sesión, serás redirigido a la pantalla de crear proyecto donde podrás definir el nombre, tipo y descripción de tu proyecto.",
  },
  {
    q: "¿Puedo invitar a otros miembros a mi proyecto?",
    a: "Sí, puedes agregar miembros a tu proyecto asignándoles roles como Product Owner, Scrum Master o Desarrollador dentro de la configuración del proyecto.",
  },
  {
    q: "¿ScrumTrack incluye tableros Kanban?",
    a: "Sí, cada sprint cuenta con un tablero Kanban visual donde puedes mover tareas entre las columnas To Do, In Progress y Done para visualizar el flujo de trabajo.",
  },
  {
    q: "¿Cómo recupero mi contraseña?",
    a: "En la pantalla de inicio de sesión, haz clic en '¿Olvidaste tu contraseña?' y sigue las instrucciones. Recibirás un enlace para restablecerla en tu correo electrónico.",
  },
  {
    q: "¿Puedo eliminar mi cuenta?",
    a: "Sí, puedes solicitar la eliminación de tu cuenta desde tu perfil o escribiendo a soporte@scrumtrack.com. Tus datos se eliminarán en un plazo de 30 días.",
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">&larr; Volver al inicio</Link>
        <h1>Preguntas Frecuentes</h1>
        <p className="legal-date">Resolvemos tus dudas sobre ScrumTrack.</p>

        <div className="faq-list">
          {faqs.map((item, i) => (
            <div className={`faq-item${openIndex === i ? " is-open" : ""}`} key={i}>
              <button className="faq-question" onClick={() => toggle(i)}>
                {item.q}
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="faq-contact">
          <h2>¿No encontraste lo que buscabas?</h2>
          <p>Escríbenos a <a href="mailto:soporte@scrumtrack.com">soporte@scrumtrack.com</a> y te responderemos a la brevedad.</p>
        </section>
      </div>
    </div>
  );
};

export default FAQPage;
