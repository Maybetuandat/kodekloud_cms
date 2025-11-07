import { api } from "@/lib/api";
import {
  Course,
  CourseResponse,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@/types/course";

export const courseService = {
  getCoursesPaginated: async (params: {
    page: number;
    pageSize: number;
    search?: string;
    isActive?: boolean;
    code?: string;
  }): Promise<CourseResponse> => {
    const queryParams: {
      page: number;
      pageSize: number;
      search?: string;
      isActive?: boolean;
      code?: string;
    } = {
      page: params.page,
      pageSize: params.pageSize,
    };

    if (params.search) {
      queryParams.search = params.search;
    }

    if (params.code) {
      queryParams.code = params.code;
    }

    if (params.isActive != null) {
      queryParams.isActive = params.isActive;
    }

    const response = await api.get<CourseResponse>("/courses", queryParams);

    return response;
  },

  getCourseById: async (id: number): Promise<Course> => {
    const response = await api.get<Course>(`/courses/${id}`);
    return response;
  },

  createCourse: async (
    data: CreateCourseRequest,
    subjectId: number
  ): Promise<Course> => {
    const response = await api.post<Course>(
      `/subjects/${subjectId}/courses`,
      data
    );
    return response;
  },

  updateCourse: async (
    id: number,
    data: UpdateCourseRequest
  ): Promise<Course> => {
    const response = await api.patch<Course>(`/courses/${id}`, data);
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

  /**
   * Add labs to course
   */
  addLabsToCourse: async (
    courseId: number,
    labIds: number[]
  ): Promise<void> => {
    await api.post(`/courses/${courseId}/labs`, labIds);
  },

  /**
   * Remove lab from course
   */
  removeLabFromCourse: async (
    courseId: number,
    labId: number
  ): Promise<void> => {
    await api.delete(`/courses/${courseId}/labs/${labId}`);
  },
};
