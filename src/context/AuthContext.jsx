import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { API_BASE } from "../lib/apiBase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | in | out
  const [user, setUser] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
      if (!res.ok) {
        setStatus("out");
        setUser(null);
        return;
      }
      const data = await res.json();
      if (data.loggedIn) {
        setStatus("in");
        setUser(data.user || null);
      } else {
        setStatus("out");
        setUser(null);
      }
    } catch {
      setStatus("out");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(() => {
    window.location.href = `${API_BASE}/login`;
  }, []);

  const logout = useCallback(() => {
    window.location.href = `${API_BASE}/api/logout`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loading: status === "loading",
        loggedIn: status === "in",
        canEdit: status === "in" && user?.login === "Alijanloo",
        user,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
