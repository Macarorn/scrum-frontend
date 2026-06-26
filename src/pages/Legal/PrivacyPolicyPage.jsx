import { Link } from "react-router-dom";
import "../../styles/legal.css";

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">&larr; Volver al inicio</Link>
        <h1>Política de Tratamiento de Datos</h1>
        <p className="legal-date">Última actualización: Junio 2026</p>

        <section>
          <h2>1. Responsable del tratamiento</h2>
          <p>ScrumTrack (en adelante, "la plataforma") es responsable del tratamiento de tus datos personales. Puedes contactarnos en <a href="mailto:soporte@scrumtrack.com">soporte@scrumtrack.com</a>.</p>
        </section>

        <section>
          <h2>2. Datos que recopilamos</h2>
          <p>Registramos la siguiente información cuando creas una cuenta: nombre completo, nombre de usuario, correo electrónico, teléfono y ciudad. También almacenamos datos de uso de la plataforma para mejorar nuestros servicios.</p>
        </section>

        <section>
          <h2>3. Finalidad del tratamiento</h2>
          <p>Tus datos se utilizan exclusivamente para: (a) gestionar tu cuenta y proporcionar los servicios de la plataforma, (b) comunicarnos contigo sobre el funcionamiento de ScrumTrack, (c) cumplir con obligaciones legales y regulatorias.</p>
        </section>

        <section>
          <h2>4. Base legal</h2>
          <p>El tratamiento de tus datos se basa en tu consentimiento explícito al aceptar nuestros términos y condiciones, y en la ejecución del contrato de servicio que aceptas al registrarte.</p>
        </section>

        <section>
          <h2>5. Derechos del titular</h2>
          <p>Puedes ejercer tus derechos de acceso, rectificación, cancelación, oposición, portabilidad y olvido escribiendo a <a href="mailto:soporte@scrumtrack.com">soporte@scrumtrack.com</a>. Responderemos a tu solicitud en un plazo máximo de 15 días hábiles.</p>
        </section>

        <section>
          <h2>6. Seguridad de los datos</h2>
          <p>Implementamos medidas técnicas y organizativas para proteger tus datos personales contra accesos no autorizados, pérdida o destrucción. Tus contraseñas se almacenan cifradas y las comunicaciones utilizan protocolos seguros.</p>
        </section>

        <section>
          <h2>7. Conservación de los datos</h2>
          <p>Conservamos tus datos mientras mantengas una cuenta activa. Al eliminar tu cuenta, tus datos personales se eliminan en un plazo de 30 días, salvo aquellos que debamos conservar por obligación legal.</p>
        </section>

        <section>
          <h2>8. Contacto</h2>
          <p>Para cualquier consulta relacionada con el tratamiento de tus datos, escríbenos a <a href="mailto:soporte@scrumtrack.com">soporte@scrumtrack.com</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
