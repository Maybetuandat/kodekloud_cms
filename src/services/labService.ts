import { CreateLabRequest, Lab, PaginatedResponse, PaginationParams, UpdateLabRequest } from "@/types/lab";
import { LabTestResponse, LabTestStatusResponse, StopTestResponse, WebSocketConnectionInfo } from "@/types/labTest";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/labs`
export const labService = {
  
    getLabsPaginated: async (
    params: PaginationParams & { 
      isActivate?: Boolean;
      search?: string; 
    }
  ): Promise<PaginatedResponse<Lab>> => {
    const url = new URL(API_BASE_URL);
    
    
    url.searchParams.append('page', params.page.toString());
    url.searchParams.append('size', params.size.toString());
    url.searchParams.append('sortBy', params.sortBy);
    url.searchParams.append('sortDir', params.sortDir);
    
    
    if (params.isActivate !== undefined) {
      url.searchParams.append('isActivate', params.isActivate.toString());
    }
    
    
    if (params.search && params.search.trim()) {
      url.searchParams.append('search', params.search.trim());
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch labs');
    }
    return response.json();
  },

  // Create new lab
  createLab: async (lab: CreateLabRequest): Promise<Lab> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lab),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create lab');
    }
    return response.json();
  },

  // Update lab
  updateLab: async (id: string, lab: UpdateLabRequest): Promise<Lab> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lab),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update lab');
    }
    return response.json();
  },

  // Delete lab
  deleteLab: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete lab');
    }
  },

  // Toggle lab status
  toggleLabStatus: async (id: string): Promise<Lab> => {
    const response = await fetch(`${API_BASE_URL}/${id}/toggle-status`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle lab status');
    }
    const result = await response.json();
    return result.lab;
  },

  // Get lab setup steps

  getLabById: async (id: string): Promise<Lab> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lab');
    }
    return response.json();
  },
 
   /**
   * Khởi tạo test lab với setup steps execution
   * Trả về thông tin WebSocket để connect realtime logs
   */
  testSetupStep: async (labId: string): Promise<LabTestResponse> => {
    const response = await fetch(`${API_BASE_URL}/test/${labId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Lấy trạng thái của pod test
   */
  getTestStatus: async (labId: string, podName: string): Promise<LabTestStatusResponse> => {
    const url = new URL(`${API_BASE_URL}/test/${labId}/status`);
    url.searchParams.append('podName', podName);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Dừng và xóa pod test
   */
  stopTestExecution: async (labId: string, podName: string): Promise<StopTestResponse> => {
    const url = new URL(`${API_BASE_URL}/test/${labId}`);
    url.searchParams.append('podName', podName);

    const response = await fetch(url.toString(), {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Lấy thông tin kết nối WebSocket cho pod cụ thể
   */
  getWebSocketInfo: async (podName: string): Promise<WebSocketConnectionInfo> => {
    const url = new URL(`${API_BASE_URL}/test/websocket-info`);
    url.searchParams.append('podName', podName);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};