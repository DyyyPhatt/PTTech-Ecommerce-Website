import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");

    if (!userToken) {
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(userToken);
      const userRoles = decodedToken.roles || [];

      const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasAccess) {
        navigate("/unauthorized");
      }
    } catch (error) {
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, allowedRoles]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
