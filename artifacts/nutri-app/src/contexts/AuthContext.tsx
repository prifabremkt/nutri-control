import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  userName: string | null;
  login: (token: string, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "nutricontrol_token";
const NAME_KEY = "nutricontrol_name";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem(NAME_KEY));

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));
  }, []);

  function login(newToken: string, name: string) {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(NAME_KEY, name);
    setToken(newToken);
    setUserName(name);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(NAME_KEY);
    setToken(null);
    setUserName(null);
  }

  return (
    <AuthContext.Provider value={{ token, userName, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
