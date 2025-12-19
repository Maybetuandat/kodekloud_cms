import { api } from "@/lib/api";
import { LoginRequest, JwtResponse, TokenRefreshResponse } from "@/types/auth";
import { getUserFromToken } from "@/utils/jwt";

class AuthService {
  private readonly AUTH_TOKEN_KEY = "authToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";
  async login(loginRequest: LoginRequest): Promise<JwtResponse> {
    const response = await api.post<JwtResponse>("/auth/login", loginRequest);
    this.setAuthToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    return response;
  }
  async refreshToken(): Promise<TokenRefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    const response = await api.post<TokenRefreshResponse>(
      "/auth/refreshtoken",
      { refreshToken }
    );
    this.setAuthToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    return response;
  }
  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  getUserInfo(): {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  } | null {
    const token = this.getAuthToken();
    if (!token) return null;

    return getUserFromToken(token);
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  hasRole(role: string): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    const userInfo = this.getUserInfo();
    return roles.some((role) => userInfo?.roles.includes(role)) ?? false;
  }

  getRoles(): string[] {
    const userInfo = this.getUserInfo();
    return userInfo?.roles ?? [];
  }
}

export const authService = new AuthService();
