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
   * Get a paginated list of labs (legacy method - for backward compatibility)
   * @param params - Pagination and filter parameters
   * @returns Promise with paginated lab list
   */
  getLabsPaginated: async (
    params: PaginationParams & {
      isActivate?: Boolean;
      search?: string;
      courseId?: number;
    }
  ): Promise<PaginatedResponse<Lab>> => {
    // If courseId is provided, use the new API
    if (params.courseId) {
      return labService.getLabsByCourseId(params.courseId, {
        page: params.page,
        size: params.size,
        search: params.search,
        isActive: params.isActivate as boolean | undefined,
      });
    }

    // Fallback to old API structure if no courseId
    const queryParams: Record<string, any> = {
      page: params.page.toString(),
      size: params.size.toString(),
      sortBy: params.sortBy,
      sortDir: params.sortDir,
    };

    if (params.isActivate !== undefined) {
      queryParams.isActivate = params.isActivate.toString();
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
  updateLab: async (id: string, lab: UpdateLabRequest): Promise<Lab> => {
    return api.put<Lab>(`/labs/${id}`, lab);
  },

  /**
   * Delete lab
   * @param id - Lab ID
   * @returns Promise with deletion result
   */
  deleteLab: async (id: string): Promise<void> => {
    return api.delete<void>(`/labs/${id}`);
  },

  /**
   * Toggle lab status
   * @param id - Lab ID
   * @returns Promise with updated lab
   */
  toggleLabStatus: async (id: string): Promise<Lab> => {
    const result = await api.put<{ lab: Lab }>(`/labs/${id}/toggle-status`);
    return result.lab;
  },

  /**
   * Get lab by ID
   * @param id - Lab ID
   * @returns Promise with lab details
   */
  getLabById: async (id: string): Promise<Lab> => {
    return api.get<Lab>(`/labs/${id}`);
  },

  /**
   * Khởi tạo test lab với setup steps execution
   * Trả về thông tin WebSocket để connect realtime logs
   * @param labId - Lab ID
   * @returns Promise with test response
   */
  testSetupStep: async (labId: string): Promise<LabTestResponse> => {
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
    labId: string,
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
