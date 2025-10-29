import {
  CreateLabRequest,
  Lab,
  PaginatedResponse,
  PaginationParams,
  UpdateLabRequest,
} from "@/types/lab";
import {
  LabTestResponse,
  LabTestStatusResponse,
  StopTestResponse,
  WebSocketConnectionInfo,
} from "@/types/labTest";
import { api } from "@/lib/api";

export const labService = {
  /**
   * Get a paginated list of labs by course ID
   * @param courseId - Course ID
   * @param params - Pagination and filter parameters
   * @returns Promise with paginated lab list
   */
  getLabsByCourseId: async (
    courseId: number,
    params: {
      page?: number;
      size?: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<PaginatedResponse<Lab>> => {
    const queryParams: Record<string, any> = {
      page: (params.page ?? 0).toString(),
      size: (params.size ?? 10).toString(),
    };

    if (params.isActive !== undefined) {
      queryParams.isActive = params.isActive.toString();
    }

    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    return api.get<PaginatedResponse<Lab>>(
      `/courses/${courseId}/labs`,
      queryParams
    );
  },

  /**
   * Get a paginated list of all labs
   * @param params - Pagination and filter parameters
   * @returns Promise with paginated lab list
   */
  getLabsPaginated: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Lab>> => {
    const queryParams: Record<string, any> = {
      page: (params.page ?? 0).toString(),
      pageSize: (params.pageSize ?? 10).toString(),
    };

    if (params.isActive !== undefined) {
      queryParams.isActive = params.isActive.toString();
    }

    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    return api.get<PaginatedResponse<Lab>>("/labs", queryParams);
  },

  /**
   * Create new lab for a course
   * @param courseId - Course ID
   * @param lab - Lab creation data
   * @returns Promise with created lab
   */
  createLabForCourse: async (
    courseId: number,
    lab: CreateLabRequest
  ): Promise<Lab> => {
    return api.post<Lab>(`/courses/${courseId}/labs`, lab);
  },

  /**
   * Create new lab (legacy method)
   * @param lab - Lab creation data
   * @returns Promise with created lab
   */
  createLab: async (lab: CreateLabRequest): Promise<Lab> => {
    return api.post<Lab>("/labs", lab);
  },

  /**
   * Update lab
   * @param id - Lab ID
   * @param lab - Lab update data
   * @returns Promise with updated lab
   */
  updateLab: async (id: number, lab: UpdateLabRequest): Promise<Lab> => {
    return api.put<Lab>(`/labs/${id}`, lab);
  },

  /**
   * Delete lab
   * @param id - Lab ID
   * @returns Promise with deletion result
   */
  deleteLab: async (id: number): Promise<void> => {
    return api.delete<void>(`/labs/${id}`);
  },

  /**
   * Toggle lab status
   * @param id - Lab ID
   * @returns Promise with updated lab
   */
  toggleLabStatus: async (id: number): Promise<Lab> => {
    const result = await api.patch<Lab>(`/labs/${id}/toggle-activation`);
    console.log("Toggle Lab Status Result:", result);
    return result;
  },

  /**
   * Get lab by ID
   * @param id - Lab ID
   * @returns Promise with lab details
   */
  getLabById: async (labId: number): Promise<Lab> => {
    return api.get<Lab>(`/labs/${labId}`);
  },

  /**
   * Khởi tạo test lab với setup steps execution
   * Trả về thông tin WebSocket để connect realtime logs
   * @param labId - Lab ID
   * @returns Promise with test response
   */
  testSetupStep: async (labId: number): Promise<LabTestResponse> => {
    return api.post<LabTestResponse>(`/labs/test/${labId}`);
  },

  /**
   * Lấy trạng thái của pod test
   * @param labId - Lab ID
   * @param podName - Pod name
   * @returns Promise with test status
   */
  getTestStatus: async (
    labId: string,
    podName: string
  ): Promise<LabTestStatusResponse> => {
    return api.get<LabTestStatusResponse>(`/labs/test/${labId}/status`, {
      podName,
    });
  },

  /**
   * Dừng và xóa pod test
   * @param labId - Lab ID
   * @param podName - Pod name
   * @returns Promise with stop response
   */
  stopTestExecution: async (
    labId: number,
    podName: string
  ): Promise<StopTestResponse> => {
    return api.delete<StopTestResponse>(
      `/labs/test/${labId}?podName=${podName}`
    );
  },

  /**
   * Lấy thông tin kết nối WebSocket cho pod cụ thể
   * @param podName - Pod name
   * @returns Promise with WebSocket connection info
   */
  getWebSocketInfo: async (
    podName: string
  ): Promise<WebSocketConnectionInfo> => {
    return api.get<WebSocketConnectionInfo>("/labs/test/websocket-info", {
      podName,
    });
  },
};
