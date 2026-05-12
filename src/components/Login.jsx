import ScrumTrackLoader from "../components/ScrumTrackLoader";
import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../assets/stylos-login.css";
import { setSessionTokens } from "../services/auth.service";


function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingScreen, setLoadingScreen] = useState(false);
 
  const [fieldErrors, setFieldErrors] = useState({
    correo: false,
    password: false,
  });
  const [toastVisible, setToastVisible] = useState(false);
  const navigate = useNavigate();

  const ingresar = async (e) => {
    e.preventDefault();
    setFieldErrors({
      correo: false,
      password: false,
    });

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: correo,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Error al iniciar sesión");
        error.code = data.error;
        throw error;
      }

      console.log("ESTOS DATOS SON PARA EL ENTORNO DE DESARROLLO; EN PRODUCCION SE BORRA ESTA LINEA:", data);
      setLoadingScreen(true);

      setTimeout(() => {
      // guardar token
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
        mensaje.includes("correo") ||
        mensaje.includes("email") ||
        mensaje.includes("usuario no encontrado") ||
        mensaje.includes("user not found") ||
        mensaje.includes("no existe") ||
        mensaje.includes("no registrado") ||
        mensaje.includes("email inválido");

      const passwordError =
        codigo === "INVALID_PASSWORD" ||
        codigo === "INVALID_CREDENTIALS" ||
        mensaje.includes("contraseña") ||
        mensaje.includes("password") ||
        mensaje.includes("credenciales inválidas") ||
        mensaje.includes("incorrecta");

      if (emailError && !passwordError) {
        setFieldErrors({
          correo: true,
          password: false,
        });
      } else if (passwordError && !emailError) {
        setFieldErrors({
          correo: false,
          password: true,
        });
      } else {
        setFieldErrors({
          correo: false,
          password: true,
        });
      }

      if (!toastVisible) {
        toast.error("Error!\nCorreo o contraseña incorrectos");
        setToastVisible(true);

        setTimeout(() => {
          setToastVisible(false);
        }, 4000);
      }
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
          <form className="login-form" onSubmit={ingresar}>
           

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
                  type="email"
                  placeholder="example@gmail.com"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      correo: false,
                    }));
                  }}
                  className={fieldErrors.correo ? "input-error" : ""}
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
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: false,
                    }));
                  }}
                  className={fieldErrors.password ? "input-error" : ""}
                  required
                />

                <button
                  type="button"
                  className={`toggle-password ${showPassword ? "active" : ""}`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi ${
                      showPassword
                        ? "bi-eye-fill"
                        : "bi-eye-slash-fill"
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
