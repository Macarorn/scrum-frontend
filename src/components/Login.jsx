import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ScrumTrackLoader from "../components/ScrumTrackLoader";
import "../styles/login.css";
import { setSessionTokens } from "../services/auth.service";
import API_URL from "../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { showError, showSuccess, showWarning } from "../utils/alerts";
import BackgroundDecorations from "./BackgroundDecorations";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);
  const [validated, setValidated] = useState(false);
  const welcomeShownRef = useRef(false);
  const loginSubmittingRef = useRef(false);

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const ingresar = async (e) => {
    e.preventDefault();

    const camposVacios = [];
    if (!correo.trim()) camposVacios.push("Correo electrónico");
    if (!password) camposVacios.push("Contraseña");

    if (camposVacios.length > 0) {
      showWarning(`Por favor completa los siguientes campos obligatorios: ${camposVacios.join(", ")}`);
      return;
    }

    if (loginSubmittingRef.current) return;

    const correoLimpio = correo.trim();

    if (!emailRegex.test(correoLimpio)) {
      showWarning("Por favor ingresa un correo electrónico válido");
      return;
    }

    try {
      loginSubmittingRef.current = true;
      const response = await fetch(`${API_URL}/auth/login`, {
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

      const emailNotVerified = codigo === "EMAIL_NOT_VERIFIED";

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

      if (emailNotVerified) {
        showWarning("Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.");
      } else if (emailError && !passwordError) {
        showError("Correo no encontrado");
      } else if (passwordError && !emailError) {
        showError("Contraseña incorrecta");
      } else {
        showError("Correo o contraseña incorrectos");
      }
      loginSubmittingRef.current = false;
    }
  };

  return (
    <>
      <ScrumTrackLoader show={loadingScreen} />

      <div className="page-login">
        {/* Decorative background shapes */}
        <BackgroundDecorations />

        <div className="login-card">
          <div className="login-left">
            <div className="auth-images auth-images-single" aria-hidden="true">
              <img
                className="auth-image auth-image-primary"
                src="/imagenes/login-team.png"
                alt=""
                loading="lazy"
              />
            </div>
            <div className="welcome-box">
              <strong>¡Bienvenido!</strong>
              <p>Accede a tu cuenta y descubre todo lo que tenemos para ti.</p>
            </div>
          </div>

          <div className="login-right">
            <form 
              className={`login-form ${validated ? 'was-validated' : ''}`} 
              onSubmit={ingresar} 
              noValidate
            >

              <h2>
                Scrum<span className="highlight">Track</span>
              </h2>
              <p className="form-subtitle">Ingresa tus datos para continuar con tus proyectos.</p>

              <div className="input-row">
                <label className="input-label" htmlFor="correo">
                  Correo electrónico
                </label>
                <div className="input-group">
                  <input
                    id="correo"
                    type="email"
                    placeholder="example@gmail.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="input input-field form-control"
                    required
                  />
                  <div className="invalid-feedback">El correo es obligatorio</div>
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-field form-control"
                    required
                  />
                  <button
                    type="button"
                    className={`toggle-password ${showPassword ? "active" : ""}`}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                  <div className="invalid-feedback" style={{ width: '100%', marginTop: '4px' }}>
                    La contraseña es obligatoria
                  </div>
                </div>
              </div>



              <button type="submit" className="login-btn">
                Iniciar sesión
              </button>

              <p className="register">
                ¿No tienes una cuenta?&nbsp;
                <Link to="/register" className="register-link">
                  Registro
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
