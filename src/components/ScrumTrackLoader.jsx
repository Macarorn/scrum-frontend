import LoadingScreen from "./scrumtrack-loaders/LoadingScreen";
import "./scrumtrack-loaders/LoadingScreen.css";

const ScrumTrackLoader = ({ show, message = "Cargando" }) => {
  if (!show) return null;

  return (
    <div className="scrumtrack-loader-overlay">
      <LoadingScreen message={message} />
    </div>
  );
};

export default ScrumTrackLoader;
