import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "../utils/alerts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No se encontró el token de verificación.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "¡Correo verificado exitosamente!");
          showSuccess("¡Correo verificado! Ya puedes iniciar sesión.");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "No se pudo verificar el correo.");
          showError(data.message || "Error de verificación");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Error de conexión al verificar el correo.");
        showError("Error de conexión");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        fontFamily: "var(--sans, 'Inter', sans-serif)",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "48px 40px",
          maxWidth: "460px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        {status === "loading" && (
          <>
            <div
              style={{
                width: "56px",
                height: "56px",
                border: "4px solid #e2e8f0",
                borderTopColor: "#39a900",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 24px",
              }}
            />
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
              Verificando tu correo...
            </h2>
            <p style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>
              Espera un momento mientras confirmamos tu cuenta.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #39a900, #22c55e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
              ¡Correo verificado!
            </h2>
            <p style={{ color: "#64748b", fontSize: "15px", margin: "0 0 24px" }}>
              {message}
            </p>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              style={{
                marginTop: "20px",
                padding: "12px 32px",
                background: "linear-gradient(135deg, #39a900, #2d8a00)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseOver={(e) => (e.target.style.transform = "scale(1.03)")}
              onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
            >
              Ir al inicio de sesión
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>
              Error de verificación
            </h2>
            <p style={{ color: "#64748b", fontSize: "15px", margin: "0 0 24px" }}>
              {message}
            </p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              style={{
                padding: "12px 32px",
                background: "linear-gradient(135deg, #39a900, #2d8a00)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ir al inicio de sesión
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
