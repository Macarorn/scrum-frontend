import React from "react";
import "../assets/ScrumTrackLoader.css";

const ScrumTrackLoader = ({ show }) => {
  if (!show) return null;

  return (
    <div className="scrumtrack-loader-overlay">
      <div className="scrumtrack-loader-box text-center">

        <div className="spinner-wrapper mb-4">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <h1 className="scrumtrack-title">
          ScrumTrack
        </h1>

        <p className="scrumtrack-subtitle mt-2">
          Cargando tablero...
        </p>

      </div>
    </div>
  );
};

export default ScrumTrackLoader;