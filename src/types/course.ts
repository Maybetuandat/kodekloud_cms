// src/types/course.ts
import { Lab } from "@/types/lab";
import { Category } from "./category";

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
  category: Category;
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

// Request để gửi lên backend
export interface CreateCourseRequest {
  title: string;
  description?: string;
  level?: string;
  durationMinutes?: number;
  shortDescription?: string;
  isActive?: boolean;
  category: {
    id: number;
  };
}

export interface UpdateCourseRequest extends CreateCourseRequest {}

export interface CourseFormData {
  title: string;
  description?: string;
  level?: string;
  durationMinutes?: number;
  shortDescription?: string;
  isActive: boolean;
  categoryId: number;
}

export interface CourseFilters {
  search: string;
  isActive?: boolean;
  sortBy: "newest" | "oldest";
}
