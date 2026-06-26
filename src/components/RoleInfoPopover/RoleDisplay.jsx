import React from "react";
import RoleInfoPopover from "./RoleInfoPopover";
import { getRoleInfo, getRoleColor, getRoleBackgroundColor } from "../../constants/scrumRoles";
import "./RoleDisplay.css";

/**
 * Componente para mostrar un rol con ícono de información contextual
 *
 * @param {Object} props
 * @param {string} props.roleName - Nombre del rol
 * @param {string} props.variant - "badge" | "text" | "pill" (default: "badge")
 * @param {boolean} props.showIcon - Mostrar ícono ⓘ (default: true)
 * @param {string} props.className - Clase CSS adicional
 * @param {string} props.popoverPosition - Posición del popover: "top" | "bottom" | "left" | "right" (default: "bottom")
 * @param {function} props.onOpenPopover - Callback cuando se abre popover
 * @param {function} props.onClosePopover - Callback cuando se cierra popover
 */
export default function RoleDisplay({
  roleName,
  roleDescription = "",
  variant = "badge",
  showIcon = true,
  className = "",
  popoverPosition = "bottom",
  onOpenPopover,
  onClosePopover,
}) {
  const roleInfo = getRoleInfo(roleName);

  const isKnownRole = !!(roleInfo && roleInfo.nombre);
  const hasPopover = showIcon && (isKnownRole || Boolean(roleDescription));

  const roleColor = isKnownRole ? getRoleColor(roleName) : "#2e7d32";
  const roleBgColor = isKnownRole ? getRoleBackgroundColor(roleName) : "#e6f4ea";

  const roleDisplay = (
    <span
      className={`role-display role-display-${variant} ${className}`}
      style={{
        "--role-color": roleColor,
        "--role-bg-color": roleBgColor,
      }}
    >
      <i
        className={`bi ${isKnownRole ? roleInfo.icon : "bi-person-badge"} role-display-role-icon`}
        aria-hidden="true"
      ></i>
      <span className="role-display-text">{roleName}</span>
      {hasPopover && (
        <RoleInfoPopover
          roleName={roleName}
          customDescription={roleDescription}
          position={popoverPosition}
          showIcon={true}
          iconClassName="role-display-info-icon"
          onOpen={onOpenPopover}
          onClose={onClosePopover}
        />
      )}
    </span>
  );

  return roleDisplay;
}
