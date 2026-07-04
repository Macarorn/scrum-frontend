import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../../services/api";
import { showWarning } from "../../utils/alerts";
import "../../styles/legal.css";

const ContactPage = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const camposVacios = [];
    if (!nombre.trim()) camposVacios.push("Nombre");
    if (!email.trim()) camposVacios.push("Correo electrónico");
    if (!mensaje.trim()) camposVacios.push("Mensaje");

    if (camposVacios.length > 0) {
      const msg = `Por favor completa los siguientes campos obligatorios: ${camposVacios.join(", ")}`;
      setError(msg);
      showWarning(msg);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, mensaje }),
      });

      if (!response.ok) throw new Error("Error al enviar el mensaje");

      setEnviado(true);
    } catch {
      setError("No se pudo enviar el mensaje. Intenta más tarde.");
    }
  };

  return (
    <div className="legal-page">
      <div className="legal-container legal-container--narrow">
        <Link to="/" className="legal-back">&larr; Volver al inicio</Link>
        <h1>Atención al Cliente</h1>
        <p className="legal-date">Estamos aquí para ayudarte.</p>

        {enviado ? (
          <div className="contact-success">
            <div className="contact-success-icon">&#10003;</div>
            <h2>¡Mensaje enviado!</h2>
            <p>Te responderemos a la brevedad posible. Revisa tu bandeja de entrada.</p>
            <Link to="/" className="legal-back" style={{ marginTop: "16px", display: "inline-block" }}>Volver al inicio</Link>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="input-row">
              <label className="input-label" htmlFor="contact-nombre">Nombre</label>
              <input id="contact-nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" required />
            </div>
            <div className="input-row">
              <label className="input-label" htmlFor="contact-email">Correo electrónico</label>
              <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required />
            </div>
            <div className="input-row">
              <label className="input-label" htmlFor="contact-mensaje">Mensaje</label>
              <textarea id="contact-mensaje" value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Describe tu consulta o problema..." rows={5} required />
            </div>

            {error && <div className="contact-error">{error}</div>}

            <button type="submit" className="contact-btn">Enviar mensaje</button>

            <div className="contact-alt">
              <p>También puedes escribirnos a: <a href="mailto:soporte@scrumtrack.com">soporte@scrumtrack.com</a></p>
              <p>Teléfono: +57 123456789</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
