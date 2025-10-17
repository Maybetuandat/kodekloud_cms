import { Lab } from "@/types/lab";

export interface Course {
  id: number;
  title: string;
  description?: string;
  level?: string;
  durationMinutes?: number;
  updatedAt?: string;
  shortDescription?: string;
  isActive: boolean;
  labs?: Lab[];
  listCourseUser?: any[];
}

export interface CourseResponse {
  data: Course[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  level?: string;
  durationMinutes?: number;
  shortDescription?: string;
  isActive?: boolean;
}

export interface UpdateCourseRequest extends CreateCourseRequest {}
