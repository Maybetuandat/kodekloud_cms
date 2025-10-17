import { useState, useCallback, useEffect } from "react";
import { courseService } from "@/services/courseService";
import {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@/types/course";

export interface CourseFilters {
  search: string;
  isActive?: boolean;
  sortBy: "newest" | "oldest";
}

// 1. Update the interface
interface UseCoursePage {
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
  handleFiltersChange: (newFilters: CourseFilters) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void; // Add this line
  refresh: () => void;
}

export const useCoursePage = (): UseCoursePage => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Use 1-based indexing for UI
  const [pageSize, setPageSize] = useState(12); // 2. Make pageSize a state variable
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<CourseFilters>({
    search: "",
    isActive: undefined,
    sortBy: "newest",
  });

  const loadCourses = useCallback(
    async (page: number, size: number, customFilters: CourseFilters) => {
      try {
        setLoading(true);
        // API often uses 0-based page index, so we subtract 1
        const response = await courseService.getCoursesPaginated({
          page: page - 1,
          size: size,
          search: customFilters.search || undefined,
          isActive: customFilters.isActive,
        });

        setCourses(response.data);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
        // API returns 0-based, so add 1 for the UI state
        setCurrentPage(response.currentPage + 1);
      } catch (error) {
        console.error("Failed to load courses:", error);
        // Handle error state if necessary
      } finally {
        setLoading(false);
      }
    },
    [] // Dependencies are passed as arguments, so this is stable
  );

  useEffect(() => {
    // 3. Re-fetch data when filters or pageSize change
    loadCourses(1, pageSize, filters); // Always fetch the first page
  }, [filters, pageSize, loadCourses]);

  const createCourse = async (
    data: CreateCourseRequest,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      setActionLoading(true);
      const newCourse = await courseService.createCourse(data);
      onSuccess?.(newCourse);
      loadCourses(currentPage, pageSize, filters); // Refresh current page
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setActionLoading(false);
    }
  };

  const updateCourse = async (
    id: number,
    data: UpdateCourseRequest,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      setActionLoading(true);
      const updatedCourse = await courseService.updateCourse(id, data);
      onSuccess?.(updatedCourse);
      loadCourses(currentPage, pageSize, filters); // Refresh current page
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCourse = async (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    try {
      setActionLoading(true);
      await courseService.deleteCourse(id);
      onSuccess?.();
      loadCourses(currentPage, pageSize, filters); // Refresh current page
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCourseStatus = async (
    course: Course,
    onSuccess?: (course: Course) => void,
    onError?: (error: Error) => void
  ) => {
    try {
      setActionLoading(true);
      const updatedCourse = await courseService.toggleCourseStatus(course.id);
      onSuccess?.(updatedCourse);
      loadCourses(currentPage, pageSize, filters); // Refresh current page
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: CourseFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadCourses(page, pageSize, filters);
  };

  // 4. Implement the new handler function
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when size changes
  };

  const refresh = () => {
    loadCourses(currentPage, pageSize, filters);
  };

  // 5. Return the new handler
  return {
    courses,
    loading,
    actionLoading,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    filters,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
    handleFiltersChange,
    handlePageChange,
    handlePageSizeChange, // Add to return object
    refresh,
  };
};
