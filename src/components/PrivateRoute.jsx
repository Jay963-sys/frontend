import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/" />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard if user is unauthorized
    if (user.role === "admin") {
      return <Navigate to="/dashboard" />;
    } else {
      return <Navigate to="/department/dashboard" />;
    }
  }

  return children;
}
