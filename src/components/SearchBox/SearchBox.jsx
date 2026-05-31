import "./SearchBox.css";
import { FiSearch } from "react-icons/fi";

export default function SearchBox({
  value,
  onChange,
  placeholder = "Buscar",
  className = "",
}) {
  return (
    <div className={`search-box ${className}`.trim()}>
      <FiSearch className="search-icon" aria-hidden="true" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label={placeholder}
      />
    </div>
  );
}