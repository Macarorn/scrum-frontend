import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import API_URL from "../services/api";
import { showError, showSuccess } from "../utils/alerts";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const correoLimpio = email.trim();
    if (!correoLimpio) return;

    if (!emailRegex.test(correoLimpio)) {
      showError("Ingresa un correo válido");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: correoLimpio }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "No se pudo procesar la solicitud");
        return;
      }

      setSent(true);
      showSuccess("Solicitud procesada correctamente");

      // In development mode, show the reset link
      if (data.data?.reset_token) {
        setResetUrl(`${window.location.origin}/reset-password?token=${data.data.reset_token}`);
      }
    } catch (error) {
      showError("Error de conexión. Intenta más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-login">
      <div className="login-deco login-deco--block-mint" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-lavender" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-peach" aria-hidden="true"></div>
      <div className="login-deco login-deco--block-yellow" aria-hidden="true"></div>

      <div className="login-deco login-deco--dots-tl" aria-hidden="true"></div>
      <div className="login-deco login-deco--dots-br" aria-hidden="true"></div>
      <div className="login-deco login-deco--dots-mid-r" aria-hidden="true"></div>
      <div className="login-deco login-deco--grid" aria-hidden="true"></div>

      <div className="login-card">
        <div className="login-left">
          <div className="auth-images auth-images-single" aria-hidden="true">
            <img className="auth-image auth-image-primary" src="/imagenes/login-team.png" alt="" loading="lazy" />
          </div>
          <div className="welcome-box">
            <strong>¿Olvidaste tu contraseña?</strong>
            <p>No te preocupes, te ayudamos a recuperar el acceso a tu cuenta.</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form">
            <h2>
              Scrum<span className="highlight">Track</span>
            </h2>

            {!sent ? (
              <>
                <p className="form-subtitle">
                  Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="input-row">
                    <label className="input-label" htmlFor="forgot-email">
                      Correo electrónico
                    </label>
                    <div className="input-group">
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button type="submit" className="login-btn" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(57, 169, 0, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#39a900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="form-subtitle" style={{ marginBottom: 12 }}>
                    Hemos enviado las instrucciones de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).
                  </p>
                </div>

                {resetUrl && (
                  <div style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 12,
                    padding: "16px",
                    marginBottom: 20,
                    fontSize: 13,
                  }}>
                    <strong style={{ display: "block", marginBottom: 8, color: "#166534" }}>
                      🔗 Enlace de recuperación (modo desarrollo):
                    </strong>
                    <a
                      href={resetUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        const url = new URL(resetUrl);
                        navigate(`${url.pathname}${url.search}`);
                      }}
                      style={{
                        color: "#15803d",
                        wordBreak: "break-all",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      {resetUrl}
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  className="login-btn"
                  onClick={() => {
                    if (resetUrl) {
                      const url = new URL(resetUrl);
                      navigate(`${url.pathname}${url.search}`);
                    } else {
                      navigate("/login");
                    }
                  }}
                >
                  {resetUrl ? "Restablecer contraseña" : "Volver al inicio de sesión"}
                </button>
              </>
            )}

            <p className="register" style={{ marginTop: 16 }}>
              <span className="register-link" onClick={() => navigate("/login")}>
                ← Volver al inicio de sesión
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
