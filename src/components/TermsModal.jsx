import { useState, useEffect } from "react";
import "../styles/terms-modal.css";

function TermsModal({ show, onClose }) {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (show) fetchTerms();
  }, [show]);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/legal/terms");
      const data = await response.json();

      if (data.success) {
        setTerms(data);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
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
    await fetch("http://localhost:3000/api/legal/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accepted: true,
        version: terms.version,
        date: new Date()
      })
    });

    onClose();
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
              Cargando términos...
            </div>
          ) : terms ? (
            <div className="terms-text">
              <p>
                <strong>Versión:</strong> {terms.version}
              </p>

              <hr />

              {/* DOCUMENTO FORMATEADO */}
              <div className="terms-document">
                {terms.content.split("\n").map((line, i) => {
                  const isTitle =
                    /^\d+(\.\d+)?\s/.test(line.trim()) ||
                    line.includes("SCRUM APP");

                  return (
                    <p
                      key={i}
                      className={
                        isTitle
                          ? "terms-title-line"
                          : "terms-paragraph"
                      }
                    >
                      {line}
                    </p>
                  );
                })}
              </div>

              {/* CHECKBOX */}
              <div className="terms-checkbox">
                <label>
                  <input
                    type="checkbox"
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  He leído y acepto los términos y condiciones
                </label>
              </div>
            </div>
          ) : (
            <div className="terms-modal-error">
              No se pudieron cargar los términos.
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="terms-modal-footer">
          <button
            className="terms-modal-accept-btn"
            disabled={!accepted}
            onClick={handleAccept}
          >
            Acepto y continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;