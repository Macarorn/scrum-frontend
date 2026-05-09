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
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
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
      <div className="login-card">
        {/* IZQUIERDA */}
        <div className="login-left">
          <div className="welcome-box">
            <strong>Únete a nosotros</strong>
            <p>Crea tu cuenta ahora y lleva tus proyectos ágiles al siguiente nivel con ScrumTrack.</p>
          </div>
        </div>

        {/* DERECHA */}
        <div className="login-right">
          <div className="login-form" style={{ maxWidth: "400px", width: "100%" }}>
            <h2>Crear cuenta</h2>

            <AutoDismissAlert show={Boolean(error)} variant="danger" className="mb-3" onClose={() => setError("")}>
              <span style={{ whiteSpace: "pre-line" }}>{error}</span>
            </AutoDismissAlert>

            <AutoDismissAlert show={Boolean(success)} variant="success" className="mb-3" onClose={() => setSuccess("")}>
              {success}
            </AutoDismissAlert>

            <div className="input-row" style={{ marginBottom: "14px" }}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nombres"
                  autoComplete="off"
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: "14px" }}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  autoComplete="off"
                  onChange={(e) => setUsuario(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: "14px" }}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  autoComplete="off"
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: "14px" }}>
              <div className="input-group">
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  autoComplete="off"
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: "14px" }}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Ciudad"
                  autoComplete="off"
                  onChange={(e) => setCiudad(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row" style={{ marginBottom: "14px" }}>
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

            <div className="input-row" style={{ marginBottom: "20px" }}>
              <div className="input-group input-password">
                <input
                  type={mostrar ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  autoComplete="new-password"
                  onChange={(e) => setConfirmar(e.target.value)}
                />
              </div>
            </div>

            <label className="register-check" style={{ fontSize: "14px", color: "#475569", display: "flex", gap: "8px", marginBottom: "24px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                style={{ accentColor: "var(--primary)", width: "16px", height: "16px", cursor: "pointer" }}
              />
              Acepto los términos y condiciones
            </label>

            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <button className="login-btn" style={{ background: "#f1f5f9", color: "#475569", boxShadow: "none", margin: 0 }} onClick={() => navigate("/login")}>
                Cancelar
              </button>
              <button className="login-btn" style={{ margin: 0 }} onClick={registrar}>
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
