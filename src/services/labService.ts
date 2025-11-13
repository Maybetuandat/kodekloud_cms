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
  getLabsByCourseId: async (
    courseId: number,
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<PaginatedResponse<Lab>> => {
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

    return api.get<PaginatedResponse<Lab>>(
      `/courses/${courseId}/labs`,
      queryParams
    );
  },
  getLabsNotInCourse: async (
    courseId: number,
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<PaginatedResponse<Lab>> => {
    const queryParams: Record<string, any> = {
      page: (params.page ?? 1).toString(),
      pageSize: (params.pageSize ?? 100).toString(),
    };

    if (params.isActive !== undefined) {
      queryParams.isActive = params.isActive.toString();
    }

    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    const response = await api.get<PaginatedResponse<Lab>>(
      `/courses/${courseId}/labs/not-in-course`,
      queryParams
    );
    console.log("Labs not in course response:", response);
    return response;
  },

  getLabsPaginated: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Lab>> => {
    const queryParams: Record<string, any> = {
      page: (params.page ?? 1).toString(),
      pageSize: (params.pageSize ?? 100).toString(),
    };

    if (params.isActive !== undefined) {
      queryParams.isActive = params.isActive.toString();
    }

    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    return api.get<PaginatedResponse<Lab>>("/labs", queryParams);
  },

  createLab: async (
    lab: CreateLabRequest,
    categoryId: number
  ): Promise<Lab> => {
    return api.post<Lab>(`/categories/${categoryId}/labs`, lab);
  },

  updateLab: async (id: number, lab: UpdateLabRequest): Promise<Lab> => {
    return api.put<Lab>(`/labs/${id}`, lab);
  },

  deleteLab: async (id: number): Promise<void> => {
    return api.delete<void>(`/labs/${id}`);
  },

  toggleLabStatus: async (id: number): Promise<Lab> => {
    const result = await api.patch<Lab>(`/labs/${id}/toggle-activation`);
    console.log("Toggle Lab Status Result:", result);
    return result;
  },

  getLabById: async (labId: number): Promise<Lab> => {
    return api.get<Lab>(`/labs/${labId}`);
  },

  testSetupStep: async (labId: number): Promise<LabTestResponse> => {
    return api.post<LabTestResponse>(`/labs/test/${labId}`);
  },

  getTestStatus: async (
    labId: string,
    podName: string
  ): Promise<LabTestStatusResponse> => {
    return api.get<LabTestStatusResponse>(`/labs/test/${labId}/status`, {
      podName,
    });
  },

  stopTestExecution: async (
    labId: number,
    podName: string
  ): Promise<StopTestResponse> => {
    return api.delete<StopTestResponse>(
      `/labs/test/${labId}?podName=${podName}`
    );
  },

  getWebSocketInfo: async (
    podName: string
  ): Promise<WebSocketConnectionInfo> => {
    return api.get<WebSocketConnectionInfo>("/labs/test/websocket-info", {
      podName,
    });
  },
};
