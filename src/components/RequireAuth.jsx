import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasValidSession } from "../services/auth.service";

const RequireAuth = () => {
  const location = useLocation();

  if (!hasValidSession()) {
    return (
      <Navigate
        to="/acceso-denegado"
        replace
        state={{
          message: "Tienes que iniciar sesión para acceder a esta pantalla.",
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
