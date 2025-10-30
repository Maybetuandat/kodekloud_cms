import { api } from "@/lib/api";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from "@/types/user";

export const userService = {
  getUsersPaginated: async (params: {
    page: number;
    pageSize: number;
    keyword?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<User>> => {
    const queryParams: {
      page: number;
      pageSize: number;
      keyword?: string;
      isActive?: boolean;
    } = {
      page: params.page,
      pageSize: params.pageSize,
    };

    if (params.keyword) {
      queryParams.keyword = params.keyword;
    }

    if (params.isActive != null) {
      queryParams.isActive = params.isActive;
    }

    const response = await api.get<PaginatedResponse<User>>(
      "/users",
      queryParams
    );

    return response;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>("/users", data);
    return response;
  },

  updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response;
  },

  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response;
  },

  toggleUserStatus: async (id: number): Promise<User> => {
    const user = await userService.getUserById(id);
    return userService.updateUser(id, {
      ...user,
      isActive: !user.isActive,
    });
  },
};
