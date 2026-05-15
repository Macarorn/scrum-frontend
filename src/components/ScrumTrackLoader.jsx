import React from "react";
import "../assets/ScrumTrackLoader.css";

const ScrumTrackLoader = ({ show }) => {
  if (!show) return null;

  return (
    <div className="scrumtrack-loader-overlay">
      <div className="scrumtrack-loader-box">
        <div className="spinner-circular">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="dot" style={{ "--index": i, animationDelay: `${i * 0.08}s` }}></div>
          ))}
          
          <div className="loader-content">
            <h1 className="scrumtrack-title">ScrumTrack</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrumTrackLoader;