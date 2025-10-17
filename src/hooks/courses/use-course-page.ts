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
  sortBy: "newest" | "oldest"; // Giữ lại sortBy nếu bạn có ý định dùng trong tương lai
}

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
  // Các hàm handle chỉ cần set state, useEffect sẽ lo việc gọi API
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
    sortBy: "newest",
  });

  // **THAY ĐỔI 1: TÁCH HÀM GỌI API RA ĐỘC LẬP**
  // Hàm này chỉ có nhiệm vụ gọi API và cập nhật state, không phụ thuộc vào state bên ngoài.
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      // Lấy state mới nhất ngay trước khi gọi API
      // API dùng page index từ 0, UI dùng từ 1
      const response = await courseService.getCoursesPaginated({
        page: currentPage - 1,
        pageSize: pageSize,
        search: filters.search || undefined,
        isActive: filters.isActive,
      });

      setCourses(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Failed to load courses:", error);
      // Có thể thêm logic xử lý lỗi ở đây, ví dụ: setCourses([])
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]); // Phụ thuộc vào các state quyết định việc fetch

  // **THAY ĐỔI 2: DÙNG useEffect LÀM NGUỒN KÍCH HOẠT DUY NHẤT**
  // Bất cứ khi nào currentPage, pageSize, hoặc filters thay đổi, useEffect này sẽ chạy lại
  // và gọi hàm fetchCourses để lấy dữ liệu mới nhất.
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]); // fetchCourses đã có dependencies của nó, nên đây là cách clean nhất

  const performActionAndRefresh = async (
    action: () => Promise<any>,
    onSuccessCallback: (result?: any) => void,
    onErrorCallback?: (error: Error) => void
  ) => {
    setActionLoading(true);
    try {
      const result = await action();
      onSuccessCallback(result);
      // Tải lại trang hiện tại sau khi thực hiện hành động thành công
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
    await performActionAndRefresh(
      () => courseService.createCourse(data),
      (newCourse) => onSuccess?.(newCourse),
      onError
    );
  };

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

  // **THAY ĐỔI 3: ĐƠN GIẢN HÓA CÁC HÀM HANDLER**
  // Các hàm này chỉ cần cập nhật state. useEffect sẽ tự động xử lý việc gọi lại API.

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
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
    setFilters,
    setCurrentPage,
    setPageSize,
    refresh: fetchCourses, // Hàm refresh chính là hàm fetchCourses
  };
};
