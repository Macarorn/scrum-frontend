import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrumTrackLoader from "../components/ScrumTrackLoader";
import "../assets/stylos-login.css";
import { setSessionTokens } from "../services/auth.service";
import { showError, showSuccess, showWarning } from "../utils/alerts";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [validationState, setValidationState] = useState({
    email: "neutral",
    password: "neutral",
  });
  const welcomeShownRef = useRef(false);
  const loginSubmittingRef = useRef(false);

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const ingresar = async (e) => {
    e.preventDefault();
    if (loginSubmittingRef.current) return;

    const correoLimpio = correo.trim();

    setValidationState({
      email: "neutral",
      password: "neutral",
    });

    if (!emailRegex.test(correoLimpio)) {
      setValidationState({ email: "warning", password: "neutral" });
      showWarning("Ingresa un correo válido");
      return;
    }

    try {
      loginSubmittingRef.current = true;
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: correoLimpio,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Error al iniciar sesión");
        error.code = data.error;
        throw error;
      }

      setValidationState({ email: "success", password: "success" });
      setLoadingScreen(true);
      if (!welcomeShownRef.current) {
        welcomeShownRef.current = true;
        showSuccess("Bienvenido");
      }

      setTimeout(() => {
        setSessionTokens({
          accessToken: data.data?.accessToken || data.data?.token,
          refreshToken: data.data?.refreshToken,
        });
        navigate("/perfil");
      }, 1000);
    } catch (error) {
      const mensaje = String(error.message || "").toLowerCase();
      const codigo = String(error.code || "").toUpperCase();

      const emailError =
        codigo === "USER_NOT_FOUND" ||
        mensaje.includes("usuario no encontrado") ||
        mensaje.includes("correo no registrado") ||
        mensaje.includes("correo no encontrado") ||
        mensaje.includes("user not found");

      const passwordError =
        codigo === "INVALID_PASSWORD" ||
        codigo === "INVALID_CREDENTIALS" ||
        mensaje.includes("contraseña") ||
        mensaje.includes("incorrecta");

      if (emailError && !passwordError) {
        setValidationState({ email: "error", password: "neutral" });
        showError("Correo no encontrado");
      } else if (passwordError && !emailError) {
        setValidationState({ email: "success", password: "error" });
        showError("Contraseña incorrecta");
      } else {
        setValidationState({ email: "error", password: "error" });
        showError("Correo o contraseña incorrectos");
      }
      loginSubmittingRef.current = false;
    }
  };

  return (
    <>
      <ScrumTrackLoader show={loadingScreen} />

      <div className="page-login">
        <div className="login-card">
          <div className="login-left">
            <div className="welcome-box">
              <strong>¡Bienvenido!</strong>
              <p>Accede a tu cuenta y descubre todo lo que tenemos para ti.</p>
            </div>
          </div>

          <div className="login-right">
            <form className="login-form" onSubmit={ingresar} noValidate>
              <h2>
                Bienvenidos a <span className="highlight">Scrum</span>
              </h2>

              <div className="input-row">
                <label className="input-label" htmlFor="correo">
                  Correo electrónico
                </label>

                <div className="input-group">
                  <input
                    id="correo"
                    type="text"
                    placeholder="example@gmail.com"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      setValidationState((prev) => ({
                        ...prev,
                        email: "neutral",
                      }));
                    }}
                    className={`input input-field ${validationState.email}`}
                    required
                  />
                </div>
              </div>

              <div className="input-row">
                <label className="input-label" htmlFor="password">
                  Contraseña
                </label>

                <div className="input-group input-password">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setValidationState((prev) => ({
                        ...prev,
                        password: "neutral",
                      }));
                    }}
                    className={`input input-field ${validationState.password}`}
                    required
                  />

                  <button
                    type="button"
                    className={`toggle-password ${showPassword ? "active" : ""}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"
                      }`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="options">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span>Aceptar términos y condiciones</span>
                </label>
              </div>

              <button type="submit" className="login-btn">
                Iniciar sesión
              </button>

              <p className="register">
                ¿No tienes una cuenta?&nbsp;

                <span
                  className="register-link"
                  onClick={() => navigate("/register")}
                >
                  Registro
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
