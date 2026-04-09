import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/stylos-Register.css";
import { setSessionTokens } from "../services/auth.service";

function Register() {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [genero, setGenero] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);

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

    // VALIDACIONES (como la profe ✔️)
    if (
      nombreLimpio === "" ||
      fecha === "" ||
      genero === "" ||
      usuario === "" ||
      correoLimpio === "" ||
      password === "" ||
      confirmar === ""
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (nombreLimpio.length < 3) {
      alert("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (!emailRegex.test(correoLimpio)) {
      alert("Correo inválido");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        "La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número",
      );
      return;
    }

    if (password !== confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreLimpio,
          email: correoLimpio,
          password,
          confirmPassword: confirmar,
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

      const loginResponse = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: correoLimpio,
            password,
          }),
        },
      );

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        alert("Registro exitoso. Inicia sesión para continuar.");
        navigate("/login");
        return;
      }

      setSessionTokens({
        accessToken: loginData.data?.accessToken || loginData.data?.token,
        refreshToken: loginData.data?.refreshToken,
      });

      alert("Usuario registrado correctamente");
      navigate("/crear-proyecto");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="register-container">
      {/* IZQUIERDA */}
      <div className="left-panel">
        <h2>
          ¿Aún no tienes una cuenta?
          <br />
          Regístrate ahora y únete a nosotros.
        </h2>
      </div>

      {/* DERECHA */}
      <div className="right-panel">
        <h2>Crear cuenta</h2>

        <input
          type="text"
          className="input"
          placeholder="Nombres"
          onChange={(e) => setNombre(e.target.value)}
        />

        {/* FECHA + GENERO */}
        <div className="dob">
          <input
            type="date"
            className="input"
            onChange={(e) => setFecha(e.target.value)}
          />

          <select className="input" onChange={(e) => setGenero(e.target.value)}>
            <option value="">Género</option>
            <option>Femenino</option>
            <option>Masculino</option>
          </select>
        </div>

        <input
          type="text"
          className="input"
          placeholder="Nombre de usuario"
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="email"
          className="input"
          placeholder="Correo electrónico"
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          type={mostrar ? "text" : "password"}
          className="input"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type={mostrar ? "text" : "password"}
          className="input"
          placeholder="Confirmar contraseña"
          onChange={(e) => setConfirmar(e.target.value)}
        />

        {/* MOSTRAR PASSWORD */}
        <label>
          <input type="checkbox" onChange={() => setMostrar(!mostrar)} />{" "}
          Mostrar contraseña
        </label>

        {/* BOTONES */}
        <div className="actions">
          <button className="cancel-btn" onClick={() => navigate("/login")}>
            Cancelar
          </button>

          <button className="login-btn" onClick={registrar}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
