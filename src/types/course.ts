import { Lab } from "@/types/lab";
import { Subject } from "./subject";

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
  Subject: Subject;
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
  Subject: {
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
  SubjectId: number;
}

export interface CourseFilters {
  search: string;
  isActive?: boolean;
  sortBy: "newest" | "oldest";
  code?: string;
}
