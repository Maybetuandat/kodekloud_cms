const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  private setAuthToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${this.baseURL}/auth/refreshtoken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    this.setAuthToken(data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    return data.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available (except for auth endpoints)
    const isAuthEndpoint =
      endpoint.includes("/auth/login") ||
      endpoint.includes("/auth/refreshtoken");

    if (!isAuthEndpoint) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      headers: headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !isAuthEndpoint) {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              const newToken = await this.refreshAccessToken();
              this.isRefreshing = false;
              this.onRefreshed(newToken);

              headers["Authorization"] = `Bearer ${newToken}`;
              return this.request<T>(endpoint, { ...options, headers });
            } catch (refreshError) {
              this.isRefreshing = false;
              throw refreshError;
            }
          } else {
            return new Promise((resolve, reject) => {
              this.addRefreshSubscriber((token: string) => {
                headers["Authorization"] = `Bearer ${token}`;
                this.request<T>(endpoint, { ...options, headers })
                  .then(resolve)
                  .catch(reject);
              });
            });
          }
        }
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

      console.log("📊 Response data:", responseData);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;

        if (typeof responseData === "object" && responseData !== null) {
          if (
            "detail" in responseData &&
            typeof responseData.detail === "string"
          ) {
            errorMessage = responseData.detail;
          } else if (
            "message" in responseData &&
            typeof responseData.message === "string"
          ) {
            errorMessage = responseData.message;
          } else {
            errorMessage = JSON.stringify(responseData);
          }
        } else if (typeof responseData === "string") {
          errorMessage = responseData;
        }

        console.error("❌ API Error Response:", responseData);
        throw new Error(errorMessage);
      }

      return responseData as T;
    } catch (error) {
      console.error("💥 API Request Failed:", {
        url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Network error - Unable to connect to server");
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.request<T>(endpoint + queryString, { method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: { signal?: AbortSignal }
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      signal: options?.signal,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
