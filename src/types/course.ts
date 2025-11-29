import { Lab } from "@/types/lab";
import { Subject } from "./subject";

export interface Course {
  id: number;
  title: string;
  description?: string;
  level?: string;
  updatedAt?: string;
  shortDescription?: string;
  isActive: boolean;
  labs?: Lab[];
  subject?: Subject;
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
  shortDescription?: string;
  isActive?: boolean;
  subjectId?: number;
}

export interface UpdateCourseRequest extends CreateCourseRequest {}

export interface CourseFormData {
  title: string;
  description?: string;
  level?: string;
  durationMinutes?: number;
  shortDescription?: string;
  isActive: boolean;
  subjectId: number;
}

export interface CourseFilters {
  search: string;
  isActive?: boolean;
  sortBy: "newest" | "oldest";
  code?: string;
}
