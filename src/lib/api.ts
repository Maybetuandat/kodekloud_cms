const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
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

    const config: RequestInit = {
      headers: headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Xử lý phản hồi không có nội dung (ví dụ: DELETE thành công)
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

  // GET - Lấy dữ liệu
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.request<T>(endpoint + queryString, { method: "GET" });
  }

  // POST - Tạo mới dữ liệu
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

  // PUT - Cập nhật toàn bộ tài nguyên
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH - Cập nhật một phần tài nguyên
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE - Xóa tài nguyên
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // HEAD - Lấy headers (không lấy body)
  async head(endpoint: string): Promise<Headers> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, { method: "HEAD" });
    return response.headers;
  }

  // OPTIONS - Lấy các phương thức HTTP được hỗ trợ
  async options(endpoint: string): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    return await fetch(url, { method: "OPTIONS" });
  }

  // UPLOAD FILE - Gửi file lên server
  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = "file",
    additionalData?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        // Không set Content-Type, để browser tự động set với boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || `HTTP ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("💥 File Upload Failed:", error);
      throw error;
    }
  }

  // UPLOAD MULTIPLE FILES - Gửi nhiều file
  async uploadFiles<T>(
    endpoint: string,
    files: File[],
    fieldName: string = "files",
    additionalData?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const formData = new FormData();

    files.forEach((file) => {
      formData.append(fieldName, file);
    });

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || `HTTP ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("💥 Multiple Files Upload Failed:", error);
      throw error;
    }
  }

  // DOWNLOAD FILE - Tải file về
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();

      // Lấy filename từ header nếu không được cung cấp
      const contentDisposition = response.headers.get("content-disposition");
      let finalFilename = filename;

      if (!finalFilename && contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          finalFilename = filenameMatch[1];
        }
      }

      if (!finalFilename) {
        finalFilename = "download";
      }

      // Tạo link tạm để download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("💥 File Download Failed:", error);
      throw error;
    }
  }

  // DOWNLOAD FILE AS BLOB - Lấy file dưới dạng Blob
  async downloadFileAsBlob(endpoint: string): Promise<Blob> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("💥 File Download as Blob Failed:", error);
      throw error;
    }
  }

  // STREAM DATA - Xử lý streaming data (SSE, etc.)
  async stream(
    endpoint: string,
    onMessage: (data: any) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        try {
          const data = JSON.parse(chunk);
          onMessage(data);
        } catch {
          onMessage(chunk);
        }
      }
    } catch (error) {
      console.error("💥 Stream Failed:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
      throw error;
    }
  }
}

export const api = new ApiClient(API_BASE_URL);
