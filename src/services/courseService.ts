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
    pageSize?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<CourseResponse> => {
    console.log("PARAMS", params);

    // 1. Tạo một đối tượng cơ bản với các tham số bắt buộc
    const queryParams: {
      page: number;
      pageSize: number;
      search?: string; // Đánh dấu là tùy chọn
      isActive?: boolean; // Đánh dấu là tùy chọn
    } = {
      page: params.page || 0,
      pageSize: params.pageSize || 12,
    };

    // 2. Chỉ thêm 'search' nếu nó có giá trị (không phải null, undefined, hoặc chuỗi rỗng)
    if (params.search) {
      queryParams.search = params.search;
    }

    // 3. Chỉ thêm 'isActive' nếu nó không phải là null hoặc undefined (cho phép giá trị false)
    if (params.isActive != null) {
      queryParams.isActive = params.isActive;
    }

    // 4. Gọi API với đối tượng queryParams đã được xây dựng hoàn chỉnh
    const response = await api.get<CourseResponse>("/courses", queryParams);

    return response;
  },

  // ...

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
