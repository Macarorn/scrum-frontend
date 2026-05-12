import { useState, useEffect, useRef } from "react";
import "../styles/terms-modal.css";

function TermsModal({ show, onClose, onAccept }) {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreement, setAgreement] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    setAgreement(null);
    setSubmitting(false);
    setError("");

    if (!terms) {
      fetchTerms();
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [show]);

  const fetchTerms = async () => {
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
  };

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
          <h2>Términos y Condiciones</h2>
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
              <div style={{
                display: "inline-block",
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "700",
                marginBottom: "24px",
                textAlign: "left"
              }}>
                📄 Versión {terms.version}
              </div>

              <hr />

              {/* DOCUMENTO FORMATEADO */}
              <div className="terms-document">
                {terms.content.split("\n").map((line, i) => {
                  const trimmed = line.trim();
                  
                  // Detectar nivel de título
                  const mainTitleMatch = trimmed.match(/^\d+\.\s+(.+)$/);
                  const subTitleMatch = trimmed.match(/^[•-]\s+(.+)$/) || trimmed.match(/^[◦◆■]\s+(.+)$/);
                  const emphasizedMatch = trimmed.match(/^⚠\s+(.+)$/) || trimmed.match(/^✓\s+(.+)$/);
                  
                  const isMainTitle = mainTitleMatch || /^[A-Z\s]{10,}$/.test(trimmed) || trimmed.includes("SCRUM APP");
                  const isSubTitle = subTitleMatch && !isMainTitle;
                  const isEmphaszed = emphasizedMatch;
                  const isEmpty = trimmed === "";

                  if (isEmpty) {
                    return <div key={i} style={{ height: "8px" }} />;
                  }

                  if (isMainTitle) {
                    return (
                      <h3 key={i} className="terms-main-title">
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

              {/* CHECKBOX */}
              <div className="terms-checkbox">
                <fieldset>
                  <legend>⚠️ Selecciona tu decisión sobre los términos</legend>
                  <label>
                    <input
                      type="radio"
                      name="agreement"
                      value="agree"
                      checked={agreement === "agree"}
                      onChange={() => setAgreement("agree")}
                    />
                    ✓ Estoy de acuerdo
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="agreement"
                      value="disagree"
                      checked={agreement === "disagree"}
                      onChange={() => setAgreement("disagree")}
                    />
                    ✕ No estoy de acuerdo
                  </label>
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
        <div className="terms-modal-footer">
          <button
            className="terms-modal-accept-btn"
            disabled={agreement !== "agree" || submitting}
            onClick={handleAccept}
          >
            {submitting ? "Guardando..." : "✓ Acepto y continuar"}
          </button>
          {agreement === "disagree" && (
            <div>
              ⚠️ Debes estar de acuerdo para completar el registro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TermsModal;