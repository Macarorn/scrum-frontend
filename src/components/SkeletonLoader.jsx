import React from "react";
import "../styles/SkeletonLoader.css";

export default function SkeletonLoader({ type = "text", count = 1, className = "" }) {
  const elements = [];

  for (let i = 0; i < count; i++) {
    elements.push(
      <div
        key={i}
        className={`skeleton-loader skeleton-${type} ${className}`}
      ></div>
    );
  }

  return <>{elements}</>;
}
