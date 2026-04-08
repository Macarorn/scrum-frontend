import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/stylos-login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const ingresar = (e) => {
    e.preventDefault();

    if (correo === "sofia@gmail.com" && password === "1234") {
      navigate("/usuarios");
    } else {
      alert("Correo o contraseña incorrectos");
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

            <button className="google-btn" type="button">
              <img
                src="https://img.icons8.com/color/16/000000/google-logo.png"
                alt="Google"
              />
              Iniciar sesión con Google
            </button>

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
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Mostrar contraseña"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
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
              <span className="register-link" onClick={() => navigate("/register")}>Registro</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;