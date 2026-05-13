import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/stylos-register.css";
import { setSessionTokens } from "../services/auth.service";
import { showError, showInfo, showSuccess, showWarning } from "../utils/alerts";

function Register() {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [genero, setGenero] = useState("");
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationState, setValidationState] = useState({
    nombre: "neutral",
    fecha: "neutral",
    genero: "neutral",
    usuario: "neutral",
    email: "neutral",
    password: "neutral",
    confirmar: "neutral",
  });

  const navigate = useNavigate();
  const registerSuccessShownRef = useRef(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  const neutralState = {
    nombre: "neutral",
    fecha: "neutral",
    genero: "neutral",
    usuario: "neutral",
    email: "neutral",
    password: "neutral",
    confirmar: "neutral",
  };

  const successState = {
    nombre: "success",
    fecha: "success",
    genero: "success",
    usuario: "success",
    email: "success",
    password: "success",
    confirmar: "success",
  };

  const resetField = (field) => {
    setValidationState((prev) => ({
      ...prev,
      [field]: "neutral",
    }));
  };

  useEffect(() => {
    console.log("Componente Register cargado");
  }, []);

  const registrar = async () => {
    if (isSubmitting || registerSuccessShownRef.current) return;

    const nombreLimpio = nombre.trim();
    const usuarioLimpio = usuario.trim();
    const correoLimpio = correo.trim();

    setValidationState(neutralState);

    if (
      nombreLimpio === "" ||
      fecha === "" ||
      genero === "" ||
      usuarioLimpio === "" ||
      correoLimpio === "" ||
      password === "" ||
      confirmar === ""
    ) {
      setValidationState({
        nombre: nombreLimpio === "" ? "warning" : "neutral",
        fecha: fecha === "" ? "warning" : "neutral",
        genero: genero === "" ? "warning" : "neutral",
        usuario: usuarioLimpio === "" ? "warning" : "neutral",
        email: correoLimpio === "" ? "warning" : "neutral",
        password: password === "" ? "warning" : "neutral",
        confirmar: confirmar === "" ? "warning" : "neutral",
      });
      showWarning("Todos los campos son obligatorios");
      return;
    }

    if (nombreLimpio.length < 3) {
      setValidationState({ ...neutralState, nombre: "warning" });
      showWarning("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (!emailRegex.test(correoLimpio)) {
      setValidationState({ ...neutralState, email: "warning" });
      showWarning("Ingresa un correo válido");
      return;
    }

    if (!passwordRegex.test(password)) {
      setValidationState({ ...neutralState, password: "warning" });
      showWarning(
        "La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número",
      );
      return;
    }

    if (password !== confirmar) {
      setValidationState({
        ...neutralState,
        password: "warning",
        confirmar: "warning",
      });
      showWarning("La contraseña debe coincidir");
      return;
    }

    try {
      setIsSubmitting(true);
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
        const error = new Error(data.message || "Error al registrar");
        error.details = data.details;
        throw error;
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

      setValidationState(successState);

      if (!loginResponse.ok) {
        registerSuccessShownRef.current = true;
        showInfo("Registro exitoso. Inicia sesión para continuar.");
        setTimeout(() => navigate("/login"), 1200);
        return;
      }

      setSessionTokens({
        accessToken: loginData.data?.accessToken || loginData.data?.token,
        refreshToken: loginData.data?.refreshToken,
      });

      if (!registerSuccessShownRef.current) {
        registerSuccessShownRef.current = true;
        showSuccess("Usuario registrado correctamente");
      }
      setTimeout(
        () => navigate("/crear-proyecto", { state: { forceFirstVisit: true } }),
        900,
      );
    } catch (error) {
      const message = error.message || "No se pudo completar el registro";
      const details = error.details || {};
      const messageLower = message.toLowerCase();

      if (details.confirmPassword) {
        setValidationState({
          ...neutralState,
          password: "warning",
          confirmar: "warning",
        });
        showWarning("La contraseña debe coincidir");
        return;
      } else if (details.password) {
        setValidationState({ ...neutralState, password: "warning" });
      } else if (details.email || messageLower.includes("email")) {
        setValidationState({ ...neutralState, email: "error" });
      }

      showError(message);
    } finally {
      setIsSubmitting(false);
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
          className={`input input-field ${validationState.nombre}`}
          placeholder="Nombres"
          onChange={(e) => {
            setNombre(e.target.value);
            resetField("nombre");
          }}
        />

        {/* FECHA + GENERO */}
        <div className="dob">
          <input
            type="date"
            className={`input input-field ${validationState.fecha}`}
            onChange={(e) => {
              setFecha(e.target.value);
              resetField("fecha");
            }}
          />

          <select
            className={`input input-field ${validationState.genero}`}
            onChange={(e) => {
              setGenero(e.target.value);
              resetField("genero");
            }}
          >
            <option value="">Género</option>
            <option>Femenino</option>
            <option>Masculino</option>
          </select>
        </div>

        <input
          type="text"
          className={`input input-field ${validationState.usuario}`}
          placeholder="Nombre de usuario"
          onChange={(e) => {
            setUsuario(e.target.value);
            resetField("usuario");
          }}
        />

        <input
          type="text"
          className={`input input-field ${validationState.email}`}
          placeholder="Correo electrónico"
          onChange={(e) => {
            setCorreo(e.target.value);
            resetField("email");
          }}
        />

        <input
          type={mostrar ? "text" : "password"}
          className={`input input-field ${validationState.password}`}
          placeholder="Contraseña"
          onChange={(e) => {
            setPassword(e.target.value);
            resetField("password");
          }}
        />

        <input
          type={mostrar ? "text" : "password"}
          className={`input input-field ${validationState.confirmar}`}
          placeholder="Confirmar contraseña"
          onChange={(e) => {
            setConfirmar(e.target.value);
            resetField("confirmar");
          }}
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

          <button className="login-btn" onClick={registrar} disabled={isSubmitting}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
