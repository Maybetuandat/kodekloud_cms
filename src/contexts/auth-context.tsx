import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoginRequest, JwtResponse } from "@/types/auth";

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  getRoles: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_ADMIN_ROLES = ["ROLE_ADMIN", "ROLE_LECTURER"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = () => {
      try {
        const userInfo = authService.getUserInfo();
        const token = authService.getAuthToken();

        if (userInfo && token) {
          const hasAllowedRole = userInfo.roles.some((role) =>
            ALLOWED_ADMIN_ROLES.includes(role)
          );

          if (hasAllowedRole) {
            setUser(userInfo);
          } else {
            authService.logout();
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        setIsLoading(true);
        const response: JwtResponse = await authService.login(credentials);

        const hasAllowedRole = response.roles.some((role) =>
          ALLOWED_ADMIN_ROLES.includes(role)
        );

        if (!hasAllowedRole) {
          authService.logout();
          toast.error("Không có quyền truy cập", {
            description:
              "Tài khoản của bạn không có quyền truy cập vào hệ thống quản trị.",
          });
          throw new Error("Không có quyền truy cập hệ thống quản trị");
        }

        const userData: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          roles: response.roles,
        };

        setUser(userData);
        toast.success("Đăng nhập thành công!");

        if (response.roles.includes("ROLE_ADMIN")) {
          navigate("/subjects");
        } else if (response.roles.includes("ROLE_LECTURER")) {
          navigate("/courses");
        }
      } catch (error) {
        console.error("Login failed:", error);
        if (
          !(
            error instanceof Error &&
            error.message.includes("Không có quyền truy cập")
          )
        ) {
          toast.error("Đăng nhập thất bại", {
            description:
              error instanceof Error
                ? error.message
                : "Vui lòng kiểm tra lại thông tin đăng nhập",
          });
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate("/login");
    toast.success("Đã đăng xuất");
  }, [navigate]);

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.roles.includes(role) ?? false;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return roles.some((role) => user?.roles.includes(role)) ?? false;
    },
    [user]
  );

  const getRoles = useCallback((): string[] => {
    return user?.roles ?? [];
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
    getRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
