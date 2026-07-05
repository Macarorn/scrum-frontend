import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasValidSession } from "../services/auth.service";

const RequireAuth = () => {
  const location = useLocation();

  if (!hasValidSession()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;
