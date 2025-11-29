const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "authToken";

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== "undefined") {
      this.authToken = localStorage.getItem(TOKEN_KEY);
    }
  }

  // Hàm này sẽ được gọi từ AuthContext khi Login/Logout
  public setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        console.warn("🔒 Token expired or invalid. Clearing session.");
        this.setAuthToken(null);

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      }

      if (response.status === 204) {
        return {} as T;
      }

      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          responseData?.detail ||
          responseData?.error ||
          `HTTP Error ${response.status}`;

        throw new Error(errorMessage);
      }

      return responseData as T;
    } catch (error) {
      console.error(
        `💥 API Request Failed [${options.method || "GET"} ${endpoint}]:`,
        error
      );
      throw error;
    }
  }

  // Các method wrapper tiện lợi
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Export một instance duy nhất (Singleton pattern)
export const api = new ApiClient(API_BASE_URL);
