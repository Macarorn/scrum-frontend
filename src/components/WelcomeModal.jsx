import React from 'react';
import './WelcomeModal.css';

export default function WelcomeModal({ onStart, onSkip }) {
  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal">
        <div className="welcome-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <h2 className="welcome-modal-title">¡Bienvenido a ScrumTrack!</h2>
        <p className="welcome-modal-text">
          Hemos preparado un breve recorrido global para mostrarte dónde están las herramientas principales de la aplicación.
        </p>
        <div className="welcome-modal-actions">
          <button type="button" className="btn-skip" onClick={onSkip}>Omitir</button>
          <button type="button" className="btn-start" onClick={onStart}>Empezar recorrido</button>
        </div>
      </div>
    </div>
  );
}
