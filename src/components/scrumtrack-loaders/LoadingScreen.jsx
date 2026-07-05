import "./LoadingScreen.css";

/**
 * Pantalla de carga PRINCIPAL de ScrumTrack.
 * Usar en: bootstrap corto, redireccion tras login, cargas de pantalla completa (< 2-3 s).
 */
export default function LoadingScreen({ message = "Cargando", hideMessage = false }) {
  const word = "ScrumTrack";
  const accentFrom = 5;

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-screen__word" aria-label={word}>
        {word.split("").map((letter, i) => (
          <span
            key={i}
            className={
              "loading-screen__letter" +
              (i >= accentFrom ? " loading-screen__letter--accent" : "")
            }
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {letter}
          </span>
        ))}
      </div>
      {!hideMessage && message ? (
        <p className="loading-screen__message">{message}</p>
      ) : null}
    </div>
  );
}
