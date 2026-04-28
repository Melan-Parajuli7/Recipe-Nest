// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";   
  
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          id: decoded.id,
          role: decoded.role || "user",   
          name: decoded.name,
          email: decoded.email,
        });
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    setUser({
      id: decoded.id,
      role: decoded.role || "user",
      name: decoded.name,
      email: decoded.email,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};