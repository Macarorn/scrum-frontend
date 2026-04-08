import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/stylos-Register.css";

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

  useEffect(() => {
    console.log("Componente Register cargado");
  }, []);

  const registrar = () => {
    // VALIDACIONES (como la profe ✔️)
    if (
      nombre === "" ||
      fecha === "" ||
      genero === "" ||
      usuario === "" ||
      correo === "" ||
      password === "" ||
      confirmar === ""
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    alert("Usuario registrado correctamente");

    navigate("/login");
  };

  return (
    <div className="register-container">
      {/* IZQUIERDA */}
      <div className="left-panel">
        <h2>
          ¿Aún no tienes una cuenta?<br />
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

          <select
            className="input"
            onChange={(e) => setGenero(e.target.value)}
          >
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
          <input
            type="checkbox"
            onChange={() => setMostrar(!mostrar)}
          />{" "}
          Mostrar contraseña
        </label>

        {/* BOTONES */}
        <div className="actions">
          <button
            className="cancel-btn"
            onClick={() => navigate("/login")}
          >
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