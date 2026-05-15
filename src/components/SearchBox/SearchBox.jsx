import "./SearchBox.css";

export default function SearchBox({
  value,
  onChange,
  placeholder = "Buscar",
  className = "",
}) {
  return (
    <div className={`search-box ${className}`.trim()}>
      <i className="bx bx-search" aria-hidden="true"></i>
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