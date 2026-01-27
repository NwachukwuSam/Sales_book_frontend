import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (!token) {
      
      navigate("/");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "cashier") {
        navigate("/cashier-dashboard");
      } else {
        navigate("/");
      }
    }
  }, [token, userRole, navigate, allowedRoles]);

  if (!token) {
    return null; 
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return null; 
  }

  return children;
};

export default ProtectedRoute;