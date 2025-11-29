// src/contexts/auth-context.tsx
import { api } from "@/lib/api";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  username: string;
  roles: string[];
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  id: number;
  email: string;
  ten: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("userInfo");

        if (storedToken && storedUser) {
          api.setAuthToken(storedToken);

          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading auth data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);

      const data = await api.post<LoginResponse>("/auth/signin", {
        email,
        password,
      });

      const userData: User = {
        id: data.id,
        email: data.email,
        username: data.ten,
        roles: data.roles,
      };

      api.setAuthToken(data.accessToken);

      localStorage.setItem("userInfo", JSON.stringify(userData));
      localStorage.setItem("refreshToken", data.refreshToken);

      setToken(data.accessToken);
      setUser(userData);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.setAuthToken(null);

    localStorage.removeItem("userInfo");
    localStorage.removeItem("refreshToken");

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin =
    user?.roles.some((role) => role === "ROLE_ADMIN" || role === "ADMIN") ||
    false;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
