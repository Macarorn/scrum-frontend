import { Link } from "react-router-dom";
import "../../styles/legal.css";

const CookiesPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">&larr; Volver al inicio</Link>
        <h1>Política de Cookies</h1>
        <p className="legal-date">Última actualización: Junio 2026</p>

        <section>
          <h2>1. ¿Qué son las cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas un sitio web. Permiten recordar tus preferencias y mejorar tu experiencia de navegación.</p>
        </section>

        <section>
          <h2>2. Cookies que utilizamos</h2>
          <p><strong>Cookies técnicas (necesarias):</strong> almacenan tu token de sesión para mantenerte autenticado mientras navegas por la plataforma. Sin estas cookies, la aplicación no puede funcionar correctamente.</p>
          <p><strong>Cookies de preferencias:</strong> recuerdan tu nombre de usuario y preferencias de interfaz para ofrecerte una experiencia personalizada.</p>
          <p>No utilizamos cookies de terceros ni cookies de rastreo con fines publicitarios.</p>
        </section>

        <section>
          <h2>3. Gestión de cookies</h2>
          <p>Puedes configurar tu navegador para bloquear o eliminar cookies. Sin embargo, algunas funcionalidades de ScrumTrack podrían verse afectadas.</p>
          <p>La mayoría de navegadores permiten gestionar las cookies desde su sección de configuración o preferencias.</p>
        </section>

        <section>
          <h2>4. Cambios en la política</h2>
          <p>Nos reservamos el derecho de actualizar esta política en cualquier momento. Te notificaremos los cambios relevantes a través de la plataforma.</p>
        </section>

        <section>
          <h2>5. Contacto</h2>
          <p>Si tienes dudas sobre esta política, puedes escribirnos a <a href="mailto:soporte@scrumtrack.com">soporte@scrumtrack.com</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default CookiesPage;
