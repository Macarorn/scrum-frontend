import { useState, useEffect, useRef, useCallback } from "react";
import "../styles/terms-modal.css";

function TermsModal({ show, onClose, onAccept }) {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreement, setAgreement] = useState(null);
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
      const response = await fetch("http://localhost:3000/api/legal/terms", {
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

    setAgreement(null);
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
    if (agreement !== "agree" || submitting || !terms) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/api/legal/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
              <h2 style={{
                margin: 0,
                fontWeight: 800,
                fontSize: "1.35rem",
                letterSpacing: "-0.5px",
                color: "#1e293b",
                fontFamily: 'inherit',
                textAlign: "center"
              }}>
                SCRUM APP - Sistema de Gestión de Proyectos Ágiles
              </h2>
              <h3>
                Términos y Condiciones
              </h3>
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
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  border: "3px solid #e2e8f0",
                  borderTop: "3px solid #39a900",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                Cargando términos...
              </div>
            </div>
          ) : error ? (
            <div className="terms-modal-error">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "28px" }}>❌</span>
                {error}
                <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: "8px" }}>
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
              {/* <hr /> */}

              {/* DOCUMENTO FORMATEADO */}
              <div className="terms-document">
                {terms.content.split("\n").map((line, i) => {
                  const trimmed = line.trim();
                  
                  // Detectar solo títulos numerados (5, 5.1, 10.2.1, etc.)
                  const mainTitleMatch = trimmed.match(/^[0-9]+(?:\.[0-9]+)*\.?\s+.+$/);
                  const subTitleMatch = trimmed.match(/^[•-]\s+(.+)$/) || trimmed.match(/^[◦◆■]\s+(.+)$/);
                  const emphasizedMatch = trimmed.match(/^⚠\s+(.+)$/) || trimmed.match(/^✓\s+(.+)$/);
                  const isHighlighted = trimmed.toUpperCase().includes("SCRUM APP");
                  
                  const isMainTitle = Boolean(mainTitleMatch && /\S/.test(trimmed) && !emphasizedMatch && !subTitleMatch);
                  const isSubTitle = subTitleMatch && !isMainTitle;
                  const isEmphaszed = emphasizedMatch;
                  const isEmpty = trimmed === "";

                  if (isEmpty) {
                    return <div key={i} style={{ height: "8px" }} />;
                  }

                  if (isMainTitle) {
                    const className = isHighlighted ? "terms-main-title-highlighted" : "terms-main-title";
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

                  if (isEmphaszed) {
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

              {/* DECISION BOX REFACTORIZADO */}
              <div className="terms-decision-box">
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend style={{
                    fontWeight: 700,
                    color: "#0f172a",
                    fontSize: "1rem",
                    marginBottom: "18px",
                    display: "block",
                    textAlign: "center"
                  }}>
                    ⚠️ Selecciona tu decisión sobre los términos
                  </legend>
                  <div className="terms-decision-options">
                    {[{
                      value: "agree",
                      label: "✓ Estoy de acuerdo"
                    }, {
                      value: "disagree",
                      label: "✕ No estoy de acuerdo"
                    }].map(opt => (
                      <label
                        key={opt.value}
                        className={`terms-decision-card${agreement === opt.value ? " selected" : ""}`}
                        tabIndex={0}
                        style={{
                          outline: agreement === opt.value ? "2px solid #39a900" : "2px solid #e2e8f0",
                          background: agreement === opt.value ? "#f0fdf4" : "#fff",
                          color: agreement === opt.value ? "#166534" : "#334155",
                          boxShadow: agreement === opt.value ? "0 2px 8px rgba(57,169,0,0.08)" : "none",
                          borderRadius: "12px",
                          padding: "22px 32px",
                          margin: "0 12px",
                          minWidth: "180px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          fontSize: "1rem",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onClick={() => setAgreement(opt.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") setAgreement(opt.value);
                        }}
                        aria-pressed={agreement === opt.value}
                      >
                        <input
                          type="radio"
                          name="agreement"
                          value={opt.value}
                          checked={agreement === opt.value}
                          onChange={() => setAgreement(opt.value)}
                          style={{ display: "none" }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          ) : (
            <div className="terms-modal-error">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "28px" }}>❌</span>
                No se pudieron cargar los términos.
                <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: "8px" }}>
                  Por favor, intenta más tarde.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="terms-modal-footer" style={{ alignItems: "center", background: "none", borderTop: "none", boxShadow: "none", gap: 0 }}>
          <button
            className="terms-modal-accept-btn"
            disabled={agreement !== "agree" || submitting}
            onClick={handleAccept}
            style={{
              width: "100%",
              maxWidth: 340,
              margin: "0 auto",
              background: agreement === "agree" && !submitting ? "linear-gradient(135deg, #39a900, #2d8c00)" : "#cbd5e1",
              color: agreement === "agree" && !submitting ? "#fff" : "#94a3b8",
              boxShadow: agreement === "agree" && !submitting ? "0 4px 12px rgba(57, 169, 0, 0.2)" : "none",
              cursor: agreement === "agree" && !submitting ? "pointer" : "not-allowed"
            }}
          >
            {submitting ? "Guardando..." : "✓ Acepto y continuar"}
          </button>
          {agreement === "disagree" && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#991b1b",
              fontWeight: 600,
              fontSize: "0.95rem",
              marginTop: 18,
              textAlign: "center"
            }}>
              ⚠️ Debes estar de acuerdo para completar el registro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TermsModal;