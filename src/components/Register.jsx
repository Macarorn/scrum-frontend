import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AutoDismissAlert from "../components/AutoDismissAlert";
import TermsModal from "../components/TermsModal";
import "../assets/stylos-login.css";
import { setSessionTokens } from "../services/auth.service";
import API_URL from "../services/api";

function Register() {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [consentError, setConsentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  const buildValidationMessage = (details) => {
    if (!details || typeof details !== "object") return "";

    const labels = {
      email: "Correo",
      nombre: "Nombre",
      password: "Contraseña",
      confirmPassword: "Confirmación",
    };

    const lines = Object.entries(details).map(([field, message]) => {
      const label = labels[field] || field;
      return `${label}: ${message}`;
    });

    return lines.join("\n");
  };

  useEffect(() => {
    console.log("Componente Register cargado");
  }, []);

  const registrar = async () => {
    const nombreLimpio = nombre.trim();
    const usuarioLimpio = usuario.trim();
    const correoLimpio = correo.trim();
    const telefonoLimpio = telefono.trim();
    const ciudadLimpia = ciudad.trim();

    setError("");
    setSuccess("");
    setConsentError("");

    if (
      nombreLimpio === "" ||
      usuarioLimpio === "" ||
      correoLimpio === "" ||
      password === "" ||
      confirmar === "" ||
      telefonoLimpio === "" ||
      ciudadLimpia === ""
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!aceptaTerminos) {
      setConsentError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    if (nombreLimpio.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (!emailRegex.test(correoLimpio)) {
      setError("Correo inválido");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número");
      return;
    }

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreLimpio,
          usuario: usuarioLimpio,
          email: correoLimpio,
          password,
          confirmPassword: confirmar,
          telefono: telefonoLimpio,
          ciudad: ciudadLimpia,
          consent_granted: aceptaTerminos,
          consent_version: "v1.0",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detailsMessage = buildValidationMessage(data.details);
        const baseMessage = data.message || "Error al registrar";
        throw new Error(detailsMessage ? `${baseMessage}\n${detailsMessage}` : baseMessage);
      }

      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: correoLimpio,
          password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setSuccess("Registro exitoso. Inicia sesión para continuar.");
        setTimeout(() => navigate("/login"), 1200);
        return;
      }

      setSessionTokens({
        accessToken: loginData.data?.accessToken || loginData.data?.token,
        refreshToken: loginData.data?.refreshToken,
      });

      setSuccess("Usuario registrado correctamente");
      setTimeout(() => navigate("/crear-proyecto", { state: { forceFirstVisit: true } }), 900);
    } catch (error) {
      setError(error.message || "No se pudo completar el registro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-login">
      <div className="login-deco login-deco--block-mint" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-lavender" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-peach" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-yellow" aria-hidden="true"></div>

      <div className="login-deco login-deco--dots-tl" aria-hidden="true"></div>
      <div className="login-deco login-deco--dots-br" aria-hidden="true"></div>
      <div className="login-deco login-deco--dots-mid-r" aria-hidden="true"></div>
      <div className="login-deco login-deco--grid" aria-hidden="true"></div>

      <div className="login-card">
        <div className="login-left">
          <div className="auth-images auth-images-single" aria-hidden="true">
            <img className="auth-image auth-image-primary" src="/imagenes/regiter.png" alt="" />
          </div>
          <div className="welcome-box">
            <strong>Únete a nosotros</strong>
            <p>Crea tu cuenta ahora y lleva tus proyectos ágiles al siguiente nivel con ScrumTrack.</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form register-form">
            <h2>Crear cuenta</h2>
            <p className="form-subtitle">Completa el registro para empezar con ScrumTrack.</p>

            <AutoDismissAlert show={Boolean(error)} variant="danger" className="mb-3" onClose={() => setError("")}> 
              <span style={{ whiteSpace: "pre-line" }}>{error}</span>
            </AutoDismissAlert>

            <AutoDismissAlert show={Boolean(success)} variant="success" className="mb-3" onClose={() => setSuccess("")}> 
              {success}
            </AutoDismissAlert>

            <div className="input-group">
              <input type="text" placeholder="Nombres" value={nombre} autoComplete="off" onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="input-group">
              <input type="text" placeholder="Nombre de usuario" value={usuario} autoComplete="off" onChange={(e) => setUsuario(e.target.value)} />
            </div>
            <div className="input-group">
              <input type="email" placeholder="Correo electrónico" value={correo} autoComplete="off" onChange={(e) => setCorreo(e.target.value)} />
            </div>
            <div className="input-row row-split">
              <div className="input-group">
                <input type="tel" placeholder="Teléfono" value={telefono} autoComplete="off" onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="input-group">
                <input type="text" placeholder="Ciudad" value={ciudad} autoComplete="off" onChange={(e) => setCiudad(e.target.value)} />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group input-password">
                <input type={mostrar ? "text" : "password"} placeholder="Contraseña" value={password} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="toggle-password" onClick={() => setMostrar(!mostrar)}>
                  <i className="bi bi-eye"></i>
                </button>
              </div>
            </div>
            <div className="input-row input-row-last">
              <div className="input-group input-password">
                <input type={mostrar ? "text" : "password"} placeholder="Confirmar contraseña" value={confirmar} autoComplete="new-password" onChange={(e) => setConfirmar(e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", background: aceptaTerminos ? "#f0fdf4" : "#fff", color: aceptaTerminos ? "#166534" : "#334155" }}>
                <input type="radio" name="consent" value="agree" checked={aceptaTerminos} onChange={() => { setAceptaTerminos(true); setConsentError(""); }} style={{ display: "none" }} />
                ✓ Acepto los términos
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", border: "2px solid #e2e8f0", borderRadius: "8px", cursor: "pointer", background: !aceptaTerminos ? "#fef2f2" : "#fff", color: !aceptaTerminos ? "#991b1b" : "#334155" }}>
                <input type="radio" name="consent" value="disagree" checked={!aceptaTerminos} onChange={() => { setAceptaTerminos(false); setConsentError(""); }} style={{ display: "none" }} />
                ✕ No acepto
              </label>
            </div>

            {consentError && <div style={{ color: "red", marginBottom: "10px" }}>{consentError}</div>}

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="login-btn" type="button" onClick={() => navigate("/login")}>Cancelar</button>
              <button className="login-btn" type="button" onClick={registrar} disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </button>
            </div>

            <p className="register">
              ¿Ya tienes una cuenta? <span className="register-link" onClick={() => navigate("/login")}>Inicia sesión</span>
            </p>
          </div>
        </div>
      </div>

      <TermsModal show={mostrarTerminos} onClose={() => setMostrarTerminos(false)} onAccept={() => { setAceptaTerminos(true); setConsentError(""); setMostrarTerminos(false); }} />
    </div>
  );
}

export default Register;
