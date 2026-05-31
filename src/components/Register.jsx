import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import TermsModal from "../components/TermsModal";
import "../styles/login.css";
import { setSessionTokens } from "../services/auth.service";
import API_URL from "../services/api";
import { showError, showInfo, showSuccess, showWarning } from "../utils/alerts";

function Register() {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrar, setMostrar] = useState(false);

  const navigate = useNavigate();
  const registerSuccessShownRef = useRef(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  useEffect(() => {
    console.log("Componente Register cargado");
  }, []);

  const registrar = async () => {
    if (isSubmitting || registerSuccessShownRef.current) return;

    const nombreLimpio = nombre.trim();
    const usuarioLimpio = usuario.trim();
    const correoLimpio = correo.trim();

    setConsentError("");

    if (
      nombreLimpio === "" ||
      usuarioLimpio === "" ||
      correoLimpio === "" ||
      password === "" ||
      confirmar === ""
    ) {
      showWarning("Todos los campos son obligatorios");
      return;
    }

    if (!aceptaTerminos) {
      setConsentError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    if (nombreLimpio.length < 3) {
      showWarning("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (!emailRegex.test(correoLimpio)) {
      showWarning("Ingresa un correo válido");
      return;
    }

    if (!passwordRegex.test(password)) {
      showWarning("La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número");
      return;
    }

    if (password !== confirmar) {
      showWarning("La contraseña debe coincidir");
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
          consent_granted: aceptaTerminos,
          consent_version: "v1.0",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Error al registrar");
        error.details = data.details;
        throw error;
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
        registerSuccessShownRef.current = true;
        showInfo("Registro exitoso. Inicia sesión para continuar.");
        setTimeout(() => navigate("/login"), 1200);
        return;
      }

      setSessionTokens({
        accessToken: loginData.data?.accessToken || loginData.data?.token,
        refreshToken: loginData.data?.refreshToken,
      });

      if (!registerSuccessShownRef.current) {
        registerSuccessShownRef.current = true;
        showSuccess("Usuario registrado correctamente");
      }
      setTimeout(
        () => navigate("/crear-proyecto", { state: { forceFirstVisit: true } }),
        900,
      );
    } catch (error) {
      const message = error.message || "No se pudo completar el registro";
      const details = error.details || {};
      const messageLower = message.toLowerCase();

      if (details.confirmPassword) {
        showWarning("La contraseña debe coincidir");
        return;
      } else if (details.password) {
        // warning already shown by details
      } else if (details.email || messageLower.includes("email")) {
        // error already handled below
      }

      showError(message);
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
            <img className="auth-image auth-image-primary" src="/imagenes/register-team.png" alt="" loading="lazy" />
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

            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="reg-nombre">Nombres <span className="text-danger">*</span></label>
                <input id="reg-nombre" type="text" placeholder="Nombres" value={nombre} autoComplete="off" onChange={(e) => setNombre(e.target.value)} required />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="reg-usuario">Nombre de usuario <span className="text-danger">*</span></label>
                <input id="reg-usuario" type="text" placeholder="Nombre de usuario" value={usuario} autoComplete="off" onChange={(e) => setUsuario(e.target.value)} required />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label className="input-label" htmlFor="reg-correo">Correo electrónico <span className="text-danger">*</span></label>
                <input id="reg-correo" type="email" placeholder="Correo electrónico" value={correo} autoComplete="off" onChange={(e) => setCorreo(e.target.value)} required />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group input-password">
                <label className="input-label" htmlFor="reg-password">Contraseña <span className="text-danger">*</span></label>
                <input id="reg-password" type={mostrar ? "text" : "password"} placeholder="Contraseña" value={password} autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className="toggle-password" onClick={() => setMostrar(!mostrar)}>
                  {mostrar ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="input-row input-row-last">
              <div className="input-group input-password">
                <label className="input-label" htmlFor="reg-confirmar">Confirmar contraseña <span className="text-danger">*</span></label>
                <input id="reg-confirmar" type={mostrar ? "text" : "password"} placeholder="Confirmar contraseña" value={confirmar} autoComplete="new-password" onChange={(e) => setConfirmar(e.target.value)} required />
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                className="register-check"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "14px",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => {
                    setAceptaTerminos(e.target.checked);
                    setConsentError("");
                  }}
                  className="register-check-input"
                />
                <span>
                  Acepto los{ }
                  <button
                    type="button"
                    className="register-link"
                    onClick={() => setMostrarTerminos(true)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                    }}
                  >
                    Términos y Condiciones
                  </button>
                </span>
              </label>

              {consentError && (
                <div
                  style={{
                    color: "#dc2626",
                    fontSize: "13px",
                    marginTop: "6px",
                  }}
                >
                  {consentError} </div>
              )}
            </div>    

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="login-btn-ghost w-100" style={{ flex: 1 }} type="button" onClick={() => navigate("/login")}>Cancelar</button>
              <button className="login-btn" style={{ flex: 1 }} type="button" onClick={registrar} disabled={isSubmitting}>
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
