import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/stylos-login.css";
import { setSessionTokens } from "../services/auth.service";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const ingresar = async (e) => {
    e.preventDefault();

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
        throw new Error(data.message || "Error al iniciar sesión");
      }

      console.log("Login exitoso:", data);

      // guardar token
      setSessionTokens({
        accessToken: data.data?.accessToken,
        refreshToken: data.data?.refreshToken,
      });

      navigate("/perfil");
    } catch (error) {
      alert(error.message);
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

            <div className="options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>Aceptar términos y condiciones</span>
              </label>
              <a href="#" className="link">
                ¿Olvidó su contraseña?
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
  );
}

export default Login;
