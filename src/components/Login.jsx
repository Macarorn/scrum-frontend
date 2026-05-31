import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrumTrackLoader from "../components/ScrumTrackLoader";
import "../styles/login.css";
import { setSessionTokens } from "../services/auth.service";
import API_URL from "../services/api";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { showError, showSuccess, showWarning } from "../utils/alerts";

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
    const formEl = e.currentTarget;
    if (formEl.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (loginSubmittingRef.current) return;

    const correoLimpio = correo.trim();

    if (!emailRegex.test(correoLimpio)) {
      showWarning("Ingresa un correo válido");
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
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                  <div className="invalid-feedback" style={{ width: '100%', marginTop: '4px' }}>
                    La contraseña es obligatoria
                  </div>
                </div>
              </div>

              <div className="options d-flex justify-content-end w-100 mb-3 mt-1">
                <a href="#" className="text-success text-decoration-none" style={{ fontSize: "0.875rem" }} onClick={(e) => { e.preventDefault(); alert("Flujo de recuperación de contraseña en desarrollo."); }}>
                  ¿Olvidaste tu contraseña?
                </a>
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
