import { Link } from "react-router-dom";
import "./Breadcrumbs.css";

/**
 * Breadcrumb navigation component.
 * @param {Array<{label: string, to?: string}>} items - Breadcrumb items. Last item has no link.
 */
export default function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumbs" aria-label="Navegación de migas de pan">
      <ol className="breadcrumbs-list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={`breadcrumbs-item ${isLast ? "breadcrumbs-item--current" : ""}`}>
              {isLast || !item.to ? (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              ) : (
                <>
                  <Link to={item.to}>{item.label}</Link>
                  <span className="breadcrumbs-separator" aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
