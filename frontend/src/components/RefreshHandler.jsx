import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function RefreshHandler({ setIsAuthenticated, setUserRole, setAuthLoading }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("✅ Decoded Token:", decoded);

        setIsAuthenticated(true);
        setUserRole(decoded.role || "customer");

        // Smart redirect logic
        const publicPaths = ['/', '/landing', '/login', '/signup'];

        if (publicPaths.includes(location.pathname)) {
          if (decoded.role === "admin") {
            console.log("Admin detected → Redirecting to /admin");
            navigate("/admin", { replace: true });
          } else {
            console.log("Normal user → Redirecting to /home");
            navigate("/home", { replace: true });
          }
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("jwtToken");
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }

    setAuthLoading(false);
  }, [location.pathname, navigate, setIsAuthenticated, setUserRole, setAuthLoading]);

  return null;
}

export default RefreshHandler;