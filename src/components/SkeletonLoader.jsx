import React from "react";
import "./SkeletonLoader.css";

/**
 * Reusable skeleton loader component.
 * @param {"card"|"list"|"profile"|"kanban"} variant - The skeleton variant to display.
 * @param {number} count - Number of skeleton items (for card/list).
 */
export default function SkeletonLoader({ variant = "card", count = 3 }) {
  if (variant === "profile") {
    return (
      <div className="skeleton-profile">
        <div className="skeleton-profile-cover skeleton-pulse" />
        <div className="skeleton-profile-body">
          <div className="skeleton-avatar skeleton-pulse" />
          <div className="skeleton-line skeleton-line--name skeleton-pulse" />
          <div className="skeleton-line skeleton-line--email skeleton-pulse" />
          <div className="skeleton-stats">
            <div className="skeleton-stat skeleton-pulse" />
            <div className="skeleton-stat skeleton-pulse" />
            <div className="skeleton-stat skeleton-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "kanban") {
    return (
      <div className="skeleton-kanban">
        {[1, 2, 3, 4].map((col) => (
          <div className="skeleton-kanban-col" key={col}>
            <div className="skeleton-line skeleton-line--title skeleton-pulse" />
            {[1, 2].map((card) => (
              <div className="skeleton-kanban-card skeleton-pulse" key={card} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
          <div className="skeleton-list-item" key={i}>
            <div className="skeleton-line skeleton-line--title skeleton-pulse" />
            <div className="skeleton-line skeleton-line--body skeleton-pulse" />
            <div className="skeleton-line skeleton-line--meta skeleton-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Default: card variant
  return (
    <div className="skeleton-cards">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-card-header">
            <div className="skeleton-card-icon skeleton-pulse" />
            <div>
              <div className="skeleton-line skeleton-line--name skeleton-pulse" />
              <div className="skeleton-line skeleton-line--meta skeleton-pulse" />
            </div>
          </div>
          <div className="skeleton-line skeleton-line--body skeleton-pulse" />
          <div className="skeleton-line skeleton-line--body skeleton-line--short skeleton-pulse" />
          <div className="skeleton-card-footer">
            <div className="skeleton-line skeleton-line--meta skeleton-pulse" />
            <div className="skeleton-line skeleton-line--meta skeleton-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
