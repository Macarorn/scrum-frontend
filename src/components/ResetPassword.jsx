import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/login.css";
import API_URL from "../services/api";
import { showError, showSuccess, showWarning } from "../utils/alerts";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showError("Token de recuperación no encontrado. Solicita un nuevo enlace.");
      return;
    }

    if (!password || !confirmar) {
      showWarning("Todos los campos son obligatorios");
      return;
    }

    if (!passwordRegex.test(password)) {
      showWarning("La contraseña debe tener mínimo 8 caracteres, 1 mayúscula y 1 número");
      return;
    }

    if (password !== confirmar) {
      showWarning("Las contraseñas no coinciden");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          confirmPassword: confirmar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "No se pudo restablecer la contraseña");
        return;
      }

      setSuccess(true);
      showSuccess("Contraseña actualizada correctamente");
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
            <strong>Nueva contraseña</strong>
            <p>Elige una contraseña segura para proteger tu cuenta de ScrumTrack.</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form">
            <h2>
              Scrum<span className="highlight">Track</span>
            </h2>

            {!success ? (
              <>
                <p className="form-subtitle">
                  Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres, una mayúscula y un número.
                </p>

                {!token && (
                  <div style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 20,
                    fontSize: 13,
                    color: "#991b1b",
                  }}>
                    ⚠️ No se encontró un token válido en la URL. Por favor solicita un nuevo enlace de recuperación.
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="input-row">
                    <label className="input-label" htmlFor="reset-password">
                      Nueva contraseña
                    </label>
                    <div className="input-group input-password">
                      <input
                        id="reset-password"
                        type={mostrar ? "text" : "password"}
                        placeholder="Nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                      />
                      <button type="button" className="toggle-password" onClick={() => setMostrar(!mostrar)}>
                        {mostrar ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className="input-row input-row-last">
                    <label className="input-label" htmlFor="reset-confirmar">
                      Confirmar contraseña
                    </label>
                    <div className="input-group input-password">
                      <input
                        id="reset-confirmar"
                        type={mostrar ? "text" : "password"}
                        placeholder="Confirmar contraseña"
                        value={confirmar}
                        onChange={(e) => setConfirmar(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="login-btn" disabled={isSubmitting || !token}>
                    {isSubmitting ? "Actualizando..." : "Restablecer contraseña"}
                  </button>
                </form>
              </>
            ) : (
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
                <p className="form-subtitle" style={{ marginBottom: 20 }}>
                  Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <button type="button" className="login-btn" onClick={() => navigate("/login")}>
                  Iniciar sesión
                </button>
              </div>
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

export default ResetPassword;
