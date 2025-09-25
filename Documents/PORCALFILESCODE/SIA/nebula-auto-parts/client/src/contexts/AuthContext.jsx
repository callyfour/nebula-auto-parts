// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Restore login from localStorage on app load
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);

        // Optional: Verify token with backend (using the /api/auth/verify route I suggested earlier)
        // fetch(`${import.meta.env.VITE_API_BASE}/api/auth/verify`, {
        //   method: "POST",
        //   headers: { "Authorization": `Bearer ${token}` },
        // }).then(res => res.json()).then(data => {
        //   if (data.success) {
        //     setUser (data.user);
        //     localStorage.setItem("token", data.token);  // Update if refreshed
        //   } else {
        //     logout();  // Invalid token, clear and redirect
        //   }
        // }).catch(() => logout()).finally(() => setLoading(false));

        console.log("Restored user from storage:", parsedUser); // Debug
      } catch (err) {
        console.error("Failed to restore user:", err);
        logout();
      }
    }

    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  const value = {
    user,
    login,
    logout,
    loading,
    // Helper: Get token for API calls
    getToken: () => localStorage.getItem("token"),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
