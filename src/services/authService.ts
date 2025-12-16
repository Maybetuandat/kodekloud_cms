import { api } from "@/lib/api";
import { LoginRequest, JwtResponse, TokenRefreshResponse } from "@/types/auth";

class AuthService {
  private readonly AUTH_TOKEN_KEY = "authToken";
  private readonly REFRESH_TOKEN_KEY = "refreshToken";
  private readonly USER_INFO_KEY = "userInfo";

  async login(loginRequest: LoginRequest): Promise<JwtResponse> {
    const response = await api.post<JwtResponse>("/auth/login", loginRequest);

    this.setAuthToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    this.setUserInfo({
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      roles: response.roles,
    });

    return response;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenRefreshResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post<TokenRefreshResponse>(
      "/auth/refreshtoken",
      { refreshToken }
    );

    // Cập nhật tokens mới
    this.setAuthToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);

    return response;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  /**
   * Set auth token
   */
  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Get user info
   */
  getUserInfo(): {
    id: number;
    username: string;
    email: string;
    roles: string[];
  } | null {
    const userInfo = localStorage.getItem(this.USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Set user info
   */
  setUserInfo(userInfo: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
  }): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.roles.includes(role) ?? false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userInfo = this.getUserInfo();
    return roles.some((role) => userInfo?.roles.includes(role)) ?? false;
  }

  /**
   * Get user roles
   */
  getRoles(): string[] {
    const userInfo = this.getUserInfo();
    return userInfo?.roles ?? [];
  }
}

export const authService = new AuthService();
