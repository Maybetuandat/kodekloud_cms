import { useState, useCallback, useEffect } from "react";
import { courseService } from "@/services/courseService";
import {
  Course,
  CourseFilters,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@/types/course";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/category";

export interface UseCoursePage {
  courses: Course[];
  loading: boolean;
  actionLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  filters: CourseFilters;
  createCourse: (
    data: CreateCourseRequest,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  fetchCategories: () => Promise<Category[]>;
  updateCourse: (
    id: number,
    data: UpdateCourseRequest,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  deleteCourse: (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  toggleCourseStatus: (
    course: Course,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  setFilters: (newFilters: Partial<CourseFilters>) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
}

export const useCoursePage = (): UseCoursePage => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFiltersState] = useState<CourseFilters>({
    search: "",
    isActive: undefined,
    categorySlug: undefined, // Filter cho category
    sortBy: "newest",
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await courseService.getCoursesPaginated({
        page: currentPage - 1,
        pageSize: pageSize,
        search: filters.search || undefined,
        isActive: filters.isActive,
        categorySlug: filters.categorySlug || undefined,
      });

      setCourses(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const performActionAndRefresh = async (
    action: () => Promise<any>,
    onSuccessCallback: (result?: any) => void,
    onErrorCallback?: (error: Error) => void
  ) => {
    setActionLoading(true);
    try {
      const result = await action();
      onSuccessCallback(result);

      await fetchCourses();
    } catch (error) {
      onErrorCallback?.(error as Error);
    } finally {
      setActionLoading(false);
    }
  };

  const createCourse = async (
    data: CreateCourseRequest,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => {
    console.log("Creating course with data:", data);
    await performActionAndRefresh(
      () => courseService.createCourse(data),
      (newCourse) => onSuccess?.(newCourse),
      onError
    );
  };

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await categoryService.getAllCategories();
      return categories;
    } catch (error) {
      console.error("Failed to load categories:", error);
      return [];
    }
  }, []);

  const updateCourse = async (
    id: number,
    data: UpdateCourseRequest,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => courseService.updateCourse(id, data),
      (updatedCourse) => onSuccess?.(updatedCourse),
      onError
    );
  };

  const deleteCourse = async (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => courseService.deleteCourse(id),
      () => onSuccess?.(),
      onError
    );
  };

  const toggleCourseStatus = async (
    course: Course,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => courseService.toggleCourseStatus(course.id),
      (updatedCourse) => onSuccess?.(updatedCourse),
      onError
    );
  };

  const setFilters = (newFilterValues: Partial<CourseFilters>) => {
    // Khi filter thay đổi, luôn quay về trang 1
    setFiltersState((prevFilters) => ({ ...prevFilters, ...newFilterValues }));
    setCurrentPage(1);
  };

  const setPageSize = (newSize: number) => {
    // Khi kích thước trang thay đổi, luôn quay về trang 1
    setPageSizeState(newSize);
    setCurrentPage(1);
  };

  return {
    courses,
    loading,
    actionLoading,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    filters,
    fetchCategories,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
    setFilters,
    setCurrentPage,
    setPageSize,
    refresh: fetchCourses,
  };
};
