import { useState } from "react";
import AutoDismissAlert from "./AutoDismissAlert";
import { useNavigate } from "react-router-dom";
import "../assets/stylos-login.css";
import { setSessionTokens } from "../services/auth.service";
import API_URL from "../services/api";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const ingresar = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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
        throw new Error(data.message || "Error al iniciar sesión");
      }

      console.log("ESTOS DATOS SON PARA EL ENTORNO DE DESARROLLO; EN PRODUCCION SE BORRA ESTA LINEA:", data);

      // guardar token
      setSessionTokens({
        accessToken: data.data?.accessToken || data.data?.token,
        refreshToken: data.data?.refreshToken,
      });

      navigate("/perfil");
    } catch (error) {
      setError(error.message || "No se pudo iniciar sesión");
    }
  };

  return (
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
            <AutoDismissAlert show={Boolean(error)} variant="danger" className="mb-3" onClose={() => setError("")}>{error}</AutoDismissAlert>

            <h2>
              Scrum<span className="highlight">Track</span>
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
                  onChange={(e) => setCorreo(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={`toggle-password ${showPassword ? "active" : ""}`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                  ></i>
                </button>
              </div>
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
  );
}

export default Login;
