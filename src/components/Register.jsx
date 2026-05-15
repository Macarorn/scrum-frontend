import { useEffect, useState } from "react";
import AutoDismissAlert from "../components/AutoDismissAlert";
import { useNavigate } from "react-router-dom";
import "../assets/stylos-login.css";
import { setSessionTokens } from "../services/auth.service";
import API_URL from "../services/api";

function Register() {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      return `- ${label}: ${message}`;
    });

    return lines.join("\n");
  };

  useEffect(() => {
    console.log("Componente Register cargado");
  }, []);

  const registrar = async () => {
    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim();
    setError("");
    setSuccess("");

    // VALIDACIONES (como la profe ✔️)
    if (
      nombreLimpio === "" ||
      usuario === "" ||
      correoLimpio === "" ||
      password === "" ||
      confirmar === "" ||
      telefono === "" ||
      ciudad === "" ||
      !aceptaTerminos
    ) {
      setError("Todos los campos son obligatorios y debes aceptar los términos y condiciones");
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreLimpio,
          email: correoLimpio,
          password,
          confirmPassword: confirmar,
          telefono,
          ciudad,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detailsMessage = buildValidationMessage(data.details);
        const baseMessage = data.message || "Error al registrar";
        throw new Error(
          detailsMessage ? `${baseMessage}\n${detailsMessage}` : baseMessage,
        );
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
      setTimeout(
        () => navigate("/crear-proyecto", { state: { forceFirstVisit: true } }),
        900,
      );
    } catch (error) {
      setError(error.message || "No se pudo completar el registro");
    }
  };

  return (
    <div className="page-login">
      {/* Decorative background shapes */}
      {/* Pastel colored blocks */}
      <div className="login-deco login-deco--block-mint" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-lavender" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-peach" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-yellow" aria-hidden="true"></div>

      {/* Dotted patterns */}
      <div className="login-deco login-deco--dots-tl" aria-hidden="true"></div>
      <div className="login-deco login-deco--dots-br" aria-hidden="true"></div>
      <div className="login-deco login-deco--dots-mid-r" aria-hidden="true"></div>
      <div className="login-deco login-deco--grid" aria-hidden="true"></div>

      {/* Geometric shapes */}
      <div className="login-deco login-deco--rect-bl" aria-hidden="true"></div>
      <div className="login-deco login-deco--rect-tr" aria-hidden="true"></div>
      <div className="login-deco login-deco--sq-l" aria-hidden="true"></div>
      <div className="login-deco login-deco--sq-r" aria-hidden="true"></div>

      {/* Circles */}
      <div className="login-deco login-deco--circle-1" aria-hidden="true"></div>
      <div className="login-deco login-deco--circle-2" aria-hidden="true"></div>
      <div className="login-deco login-deco--circle-3" aria-hidden="true"></div>
      <div className="login-deco login-deco--circle-4" aria-hidden="true"></div>
      <div className="login-deco login-deco--circle-5" aria-hidden="true"></div>

      {/* SVG decorations */}
      <div className="login-deco login-deco--squiggle-r" aria-hidden="true">
        <svg viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2C8 12 32 24 20 36C8 48 32 60 20 72" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" opacity="0.12"/>
        </svg>
      </div>
      <div className="login-deco login-deco--squiggle-l" aria-hidden="true">
        <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2C32 10 8 22 20 32C32 42 8 54 20 58" stroke="#39A900" strokeWidth="1.5" strokeLinecap="round" opacity="0.12"/>
        </svg>
      </div>
      <div className="login-deco login-deco--arrow" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 32L32 8M32 8H14M32 8V26" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="login-deco login-deco--cross-1" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2V18M2 10H18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="login-deco login-deco--cross-2" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3V17M3 10H17" stroke="#39A900" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Horizontal lines */}
      <div className="login-deco login-deco--lines-l" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div className="login-deco login-deco--lines-r" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>

      <div className="login-card">
        {/* IZQUIERDA */}
        <div className="login-left">
          <div className="auth-images auth-images-single" aria-hidden="true">
            <img
              className="auth-image auth-image-primary"
              src="/imagenes/regiter.png"
              alt=""
            />
          </div>
          <div className="welcome-box">
            <strong>Únete a nosotros</strong>
            <p>Crea tu cuenta ahora y lleva tus proyectos ágiles al siguiente nivel con ScrumTrack.</p>
          </div>
        </div>

        {/* DERECHA */}
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

            <div className="input-row">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nombres"
                  autoComplete="off"
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  autoComplete="off"
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  autoComplete="off"
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row row-split">
              <div className="input-group">
                <input
                  type="tel"
                  placeholder="Teléfono"
                  autoComplete="off"
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Ciudad"
                  autoComplete="off"
                  onChange={(e) => setCiudad(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group input-password">
                <input
                  type={mostrar ? "text" : "password"}
                  placeholder="Contraseña"
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={`toggle-password ${mostrar ? "active" : ""}`}
                  onClick={() => setMostrar(!mostrar)}
                >
                  <i className={`bi ${mostrar ? "bi-eye-fill" : "bi-eye-slash-fill"}`}></i>
                </button>
              </div>
            </div>

            <div className="input-row input-row-last">
              <div className="input-group input-password">
                <input
                  type={mostrar ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  autoComplete="new-password"
                  onChange={(e) => setConfirmar(e.target.value)}
                />
              </div>
            </div>

            <label className="register-check">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="register-check-input"
              />
              Acepto los términos y condiciones
            </label>

            <div className="button-row">
              <button className="login-btn login-btn-ghost" onClick={() => navigate("/login")}>
                Cancelar
              </button>
              <button className="login-btn" onClick={registrar}>
                Registrarse
              </button>
            </div>
            
            <p className="register">
              ¿Ya tienes una cuenta?&nbsp;
              <span className="register-link" onClick={() => navigate("/login")}>
                Inicia sesión
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
