
import { useState, useEffect, useRef, useCallback } from "react";
import API_URL from "../services/api";
import "../styles/terms-modal.css";

function TermsModal({ show, onClose, onAccept }) {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const abortControllerRef = useRef(null);

  const fetchTerms = useCallback(async () => {
    if (loading || terms) return;

    setLoading(true);
    setError("");

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_URL}/legal/terms`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        setTerms(data.data);
        return;
      }

      throw new Error(data.message || "No se pudieron cargar los términos.");
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        return;
      }

      console.error("Error fetching terms:", fetchError);
      setError("No se pudieron cargar los términos. Intenta de nuevo más tarde.");
      setTerms(null);
    } finally {
      setLoading(false);
    }
  }, [loading, terms]);

  useEffect(() => {
    if (!show) return;

    setSubmitting(false);
    setError("");

    if (!terms) {
      fetchTerms();
    }
  }, [show, terms, fetchTerms]);

  useEffect(() => {
    if (!show) return;

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [show]);

  const handleScroll = (e) => {
    const el = e.target;
    const progress =
      (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;

    setScrollProgress(progress);
  };

  const handleAccept = async () => {
    if (submitting || !terms) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/legal/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accepted: true,
          version: terms.version,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Consent error:", data);
        setSubmitting(false);
        return;
      }

      if (typeof onAccept === "function") {
        onAccept();
      }

      onClose();
    } catch (error) {
      console.error("Error accepting terms:", error);
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="terms-modal-overlay" onClick={onClose}>
      <div
        className="terms-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="terms-modal-header">
          <div style={{ width: "100%", textAlign: "center" }}>
            <h2
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: "1.35rem",
                letterSpacing: "-0.5px",
                color: "#1e293b",
                fontFamily: "inherit",
                textAlign: "center",
              }}
            >
              
            </h2>

            <h3>Términos y Condiciones</h3>
          </div>

          <button className="terms-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="terms-progress-bar">
          <div style={{ width: `${scrollProgress}%` }} />
        </div>

        {/* BODY */}
        <div className="terms-modal-body" onScroll={handleScroll}>
          {loading ? (
            <div className="terms-modal-loading">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid #e2e8f0",
                    borderTop: "3px solid #39a900",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>

                Cargando términos...
              </div>
            </div>
          ) : error ? (
            <div className="terms-modal-error">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "28px" }}>❌</span>

                {error}

                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#475569",
                    marginTop: "8px",
                  }}
                >
                  Si el problema persiste, recarga la página o intenta más tarde.
                </p>

                <button
                  type="button"
                  onClick={fetchTerms}
                  style={{
                    marginTop: "16px",
                    background: "#39a900",
                    color: "white",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : terms ? (
            <div className="terms-text" style={{ textAlign: "left" }}>
              {/* PORTADA DEL DOCUMENTO */}
            <div
              style={{
                textAlign: "center",
                padding: "28px 20px 36px",
                borderBottom: "1px solid #e2e8f0",
                marginBottom: "30px",
              }}
            >
              <h1
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  marginBottom: "10px",
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                }}
              >
                SCRUM APP
              </h1>

              <h2
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "#39a900",
                  marginBottom: "26px",
                }}
              >
                Sistema de Gestión de Proyectos Ágiles
              </h2>

              <div
                style={{
                  display: "inline-block",
                  background: "#f0fdf4",
                  color: "#166534",
                  padding: "8px 18px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  marginBottom: "26px",
                  border: "1px solid #bbf7d0",
                }}
              >
                TÉRMINOS Y CONDICIONES
              </div>

              <div
                style={{
                  maxWidth: "520px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  color: "#475569",
                  fontSize: "0.98rem",
                  lineHeight: 1.7,
                }}
              >
                <p><strong>Scrum App</strong> — Plataforma de Gestión de Proyectos</p>
                <p><strong>Versión:</strong> v1.0</p>
                <p><strong>Fecha de vigencia:</strong> Mayo 2026</p>
                <p><strong>Idioma:</strong> Español</p>

                <div
                  style={{
                    marginTop: "12px",
                    padding: "14px 18px",
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: "12px",
                    color: "#9a3412",
                    fontWeight: 500,
                  }}
                >
                  Documento generado para uso académico — Proyecto universitario de gestión Scrum
                </div>
              </div>
            </div>
                          <div className="terms-document">
              {terms.content
                .split("\n")
                .filter((line) => {
                  const trimmed = line.trim().toUpperCase();

                  return ![
                    "SCRUM APP",
                    "SISTEMA DE GESTIÓN DE PROYECTOS ÁGILES",
                    "TÉRMINOS Y CONDICIONES",
                    "SCRUM APP — PLATAFORMA DE GESTIÓN DE PROYECTOS",
                    "VERSIÓN: V1.0",
                    "FECHA DE VIGENCIA: MAYO 2026",
                    "IDIOMA: ESPAÑOL",
                    "DOCUMENTO GENERADO PARA USO ACADÉMICO — PROYECTO UNIVERSITARIO DE GESTIÓN SCRUM",
                  ].includes(trimmed);
                })
                .map((line, i) => {

                  const trimmed = line.trim();

                  const mainTitleMatch = trimmed.match(
                    /^[0-9]+(?:\.[0-9]+)*\.?\s+.+$/
                  );

                  const subTitleMatch =
                    trimmed.match(/^[•-]\s+(.+)$/) ||
                    trimmed.match(/^[◦◆■]\s+(.+)$/);

                  const emphasizedMatch =
                    trimmed.match(/^⚠\s+(.+)$/) ||
                    trimmed.match(/^✓\s+(.+)$/);

                  const isHighlighted =
                    trimmed.toUpperCase().includes("SCRUM APP");

                  const isMainTitle = Boolean(
                    mainTitleMatch &&
                      /\S/.test(trimmed) &&
                      !emphasizedMatch &&
                      !subTitleMatch
                  );

                  const isSubTitle = subTitleMatch && !isMainTitle;
                  const isEmphasized = emphasizedMatch;
                  const isEmpty = trimmed === "";

                  if (isEmpty) {
                    return <div key={i} style={{ height: "8px" }} />;
                  }

                  if (isMainTitle) {
                    const className = isHighlighted
                      ? "terms-main-title-highlighted"
                      : "terms-main-title";

                    return (
                      <h3 key={i} className={className}>
                        {trimmed}
                      </h3>
                    );
                  }

                  if (isSubTitle) {
                    return (
                      <p key={i} className="terms-subtitle">
                        {trimmed}
                      </p>
                    );
                  }

                  if (isEmphasized) {
                    return (
                      <div key={i} className="terms-emphasized">
                        {trimmed}
                      </div>
                    );
                  }

                  return (
                    <p key={i} className="terms-paragraph">
                      {trimmed}
                    </p>
                  );
                })}
            </div>

              <div className="terms-decision-box">
                <p
                  style={{
                    textAlign: "center",
                    color: "#475569",
                    fontSize: "0.95rem",
                    marginTop: "10px",
                    marginBottom: "0",
                  }}
                >
                  Al continuar, aceptas los términos y condiciones de Scrum App.
                </p>
              </div>
            </div>
          ) : (
            <div className="terms-modal-error">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "28px" }}>❌</span>

                No se pudieron cargar los términos.

                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#475569",
                    marginTop: "8px",
                  }}
                >
                  Por favor, intenta más tarde.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="terms-modal-footer"
          style={{
            alignItems: "center",
            background: "none",
            borderTop: "none",
            boxShadow: "none",
            gap: 0,
          }}
        >
          <button
            className="terms-modal-accept-btn"
            disabled={submitting}
            onClick={handleAccept}
            style={{
              width: "100%",
              maxWidth: 340,
              margin: "0 auto",
              background: submitting
                ? "#cbd5e1"
                : "linear-gradient(135deg, #39a900, #2d8c00)",
              color: "#fff",
              boxShadow: submitting
                ? "none"
                : "0 4px 12px rgba(57, 169, 0, 0.2)",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Guardando..." : "✓ Acepto y continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;