import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { getRoleInfo } from "../../constants/scrumRoles";
import "./RoleInfoPopover.css";

/**
 * Componente Popover para información de roles Scrum
 * Con posicionamiento inteligente, scroll interno y responsive
 *
 * @param {Object} props
 * @param {string} props.roleName - Nombre del rol a mostrar
 * @param {string} props.position - Posición preferida: "top", "bottom", "left", "right"
 * @param {boolean} props.showIcon - Mostrar ícono ⓘ (default: true)
 * @param {string} props.iconClassName - Clase CSS adicional para el ícono
 * @param {function} props.onOpen - Callback cuando se abre el popover
 * @param {function} props.onClose - Callback cuando se cierra el popover
 */
export default function RoleInfoPopover({
  roleName,
  position = "bottom",
  showIcon = true,
  iconClassName = "",
  onOpen,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({
    position: "bottom",
    top: 0,
    left: 0,
  });

  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const [portalElement] = useState(() => document.createElement("div"));

  const roleInfo = getRoleInfo(roleName);

  if (!roleInfo || !roleInfo.nombre) {
    return null;
  }

  // Calcular posición óptima basada en espacio disponible
  const calculatePosition = () => {
    if (!buttonRef.current) return;

    const button = buttonRef.current.getBoundingClientRect();
    const popover = popoverRef.current?.getBoundingClientRect();

    if (!popover) {
      // Si el popover no está renderizado aún, retornar después del render
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 16;
    const padding = 12;

    let finalPos = position;
    let top = 0;
    let left = 0;

    // Dimensiones del popover
    const popoverWidth = popover.width;
    const popoverHeight = popover.height;

    // Calcular posiciones para cada dirección
    const positions = {
      bottom: {
        top: button.bottom + gap,
        left: button.left,
        fits:
          button.bottom + gap + popoverHeight + padding < viewportHeight &&
          button.left + popoverWidth + padding < viewportWidth,
      },
      top: {
        top: button.top - popoverHeight - gap,
        left: button.left,
        fits:
          button.top - popoverHeight - gap - padding > 0 &&
          button.left + popoverWidth + padding < viewportWidth,
      },
      right: {
        top: button.top + button.height / 2 - popoverHeight / 2,
        left: button.right + gap,
        fits:
          button.right + gap + popoverWidth + padding < viewportWidth &&
          button.top - padding > 0 &&
          button.top + button.height + padding < viewportHeight,
      },
      left: {
        top: button.top + button.height / 2 - popoverHeight / 2,
        left: button.left - popoverWidth - gap,
        fits:
          button.left - popoverWidth - gap - padding > 0 &&
          button.top - padding > 0 &&
          button.top + button.height + padding < viewportHeight,
      },
    };

    // Prioridades de posición
    const positionPriority = [position, "bottom", "top", "right", "left"];

    // Seleccionar posición que cabe, según prioridad
    for (const pos of positionPriority) {
      if (positions[pos].fits) {
        finalPos = pos;
        top = positions[pos].top;
        left = positions[pos].left;
        break;
      }
    }

    // Si ninguna posición cabe perfectamente, usar la que menos se recorta
    if (!positions[finalPos].fits) {
      let minOverflow = Infinity;
      let bestPos = position;

      Object.entries(positions).forEach(([pos, coords]) => {
        let overflow = 0;

        if (coords.top + popoverHeight > viewportHeight) {
          overflow += coords.top + popoverHeight - viewportHeight;
        } else if (coords.top < 0) {
          overflow += -coords.top;
        }

        if (coords.left + popoverWidth > viewportWidth) {
          overflow += coords.left + popoverWidth - viewportWidth;
        } else if (coords.left < 0) {
          overflow += -coords.left;
        }

        if (overflow < minOverflow) {
          minOverflow = overflow;
          bestPos = pos;
        }
      });

      finalPos = bestPos;
      top = Math.max(padding, Math.min(positions[bestPos].top, viewportHeight - popoverHeight - padding));
      left = Math.max(padding, Math.min(positions[bestPos].left, viewportWidth - popoverWidth - padding));
    }

    setPopoverPos({
      position: finalPos,
      top,
      left,
    });
  };

  useEffect(() => {
    portalElement.className = "role-info-popover-portal";
    document.body.appendChild(portalElement);

    return () => {
      if (portalElement.parentNode) {
        portalElement.parentNode.removeChild(portalElement);
      }
    };
  }, [portalElement]);

  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, roleName]);

  // Manejar clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isOpen) return;

      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    // Manejar ESC
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    // Ajustar posición en resize/scroll
    const handleResize = () => {
      if (isOpen && popoverRef.current) {
        calculatePosition();
      }
    };

    if (isOpen) {
      // Pequeño delay para permitir que el popover se renderice
      const timeoutId = setTimeout(() => {
        calculatePosition();
      }, 0);

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, true);

      onOpen?.();

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize, true);
        clearTimeout(timeoutId);
      };
    } else {
      onClose?.();
    }
  }, [isOpen, onOpen, onClose]);

  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="role-info-popover-wrapper">
      {showIcon && (
        <button
          ref={buttonRef}
          type="button"
          className={`role-info-icon ${iconClassName}`}
          onClick={togglePopover}
          title={`Información sobre ${roleName}`}
          aria-label={`Información sobre ${roleName}`}
        >
          ⓘ
        </button>
      )}

      {isOpen &&
        ReactDOM.createPortal(
          <div ref={containerRef} className="role-info-popover-container">
            <div
              ref={popoverRef}
              className={`role-info-popover role-info-popover-${popoverPos.position}`}
              style={{
                "--role-color": roleInfo.color,
                "--role-bg-color": roleInfo.backgroundColor,
                top: `${popoverPos.top}px`,
                left: `${popoverPos.left}px`,
              }}
            >
              {/* Flecha/punta del popover */}
              <div className="role-info-popover-arrow"></div>

              {/* Contenido con scroll interno */}
              <div className="role-info-popover-content">
                {/* Encabezado con ícono y título */}
                <div className="role-info-header">
                  <span className="role-info-icon-emoji">{roleInfo.icon}</span>
                  <h3 className="role-info-title">{roleInfo.nombre}</h3>
                </div>

                {/* Descripción corta */}
                <p className="role-info-description">{roleInfo.resumen}</p>

                {/* Divider */}
                <div className="role-info-divider"></div>

                {/* Responsabilidades */}
                <div className="role-info-section">
                  <h4 className="role-info-section-title">
                    Responsabilidades principales
                  </h4>
                  <ul className="role-info-list">
                    {roleInfo.responsabilidades?.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>

                {/* Footer con cierre */}
                <div className="role-info-footer">
                  <small className="role-info-footer-text">
                    Presiona ESC o haz clic fuera para cerrar
                  </small>
                </div>
              </div>
            </div>
          </div>,
          portalElement
        )}
    </div>
  );
}
