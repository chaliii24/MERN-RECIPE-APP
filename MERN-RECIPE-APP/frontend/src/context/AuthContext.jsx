import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const fetchUser = async () => {
        try {
          const res = await axios.get("/api/auth/me");
          setUser(res.data);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch user:", err);
          setUser(null);
          setError("Failed to authenticate user");
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { token, _id, username, email: userEmail, role } = res.data;
      const userData = { _id, username, email: userEmail, role };


      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
      setError(null);

      return userData;
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your credentials.");
      throw err;
    }
  };

 const register = async (username, email, password) => {
  try {
    const res = await axios.post("/api/auth/register", { username, email, password });
    const { token, _id, username: userNameFromServer, email: userEmail, role } = res.data;

    const userData = { _id, username: userNameFromServer, email: userEmail, role };

    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    setError(null);

    return userData;
  } catch (err) {
    console.error("Registration failed:", err);
    setError("Registration failed. Please try again.");
    throw err;
  }
};


  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Add this helper hook at the bottom
export const useAuth = () => useContext(AuthContext);
