import { api } from "@/lib/api";
import {
  Course,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@/types/course";

export const courseService = {
  getCoursesPaginated: async (params: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<CourseResponse> => {
    const response = await api.get<CourseResponse>("/courses", {
      params: {
        page: params.page || 0,
        size: params.size || 12,
        search: params.search,
        isActive: params.isActive,
      },
    });
    return response;
  },

  getCourseById: async (id: number): Promise<Course> => {
    const response = await api.get<Course>(`/courses/${id}`);
    return response;
  },

  createCourse: async (data: CreateCourseRequest): Promise<Course> => {
    const response = await api.post<Course>("/courses", data);
    return response;
  },

  updateCourse: async (
    id: number,
    data: UpdateCourseRequest
  ): Promise<Course> => {
    const response = await api.put<Course>(`/courses/${id}`, data);
    return response;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}`);
  },

  toggleCourseStatus: async (id: number): Promise<Course> => {
    const course = await courseService.getCourseById(id);
    return courseService.updateCourse(id, {
      ...course,
      isActive: !course.isActive,
    });
  },
};
