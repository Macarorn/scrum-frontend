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
    <div className="container">
      <div className="container">
        {/* IZQUIERDA */}
        <div className="left">
          <p className="bienvenida-texto">
            <strong>¡Bienvenido!</strong><br />
            Accede a tu cuenta y <br />
            descubre todo lo que <br />
            tenemos para ti.
          </p>
        </div>

        {/* DERECHA */}
        <div className="right">
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

            <div className="input-group">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="example@gmail.com"
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <i className="fas fa-key"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className="fas fa-eye toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            <div className="options">
              <label>
                <input type="checkbox" required /> Aceptar términos y condiciones
              </label>
              <a href="#" className="link">
                ¿Olvidó su contraseña?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Iniciar sesión
            </button>

            <p className="register">
              ¿No tienes una cuenta?{" "}
              <span
                style={{ color: "#1a73e8", cursor: "pointer" }}
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