import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { useState, useCallback } from "react";

export const useCourseUsers = (courseId: number) => {
  const [usersInCourse, setUsersInCourse] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(
    undefined
  );

  /**
   * Load users in course
   */
  const loadUsers = useCallback(
    async (page: number, keyword?: string, isActive?: boolean) => {
      if (!courseId) {
        console.warn("courseId is required to load users");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await userService.getUsersInCoursePaginated(
          {
            page: page,
            pageSize: pageSize,
            keyword: keyword,
            isActive: isActive,
          },
          courseId
        );

        setUsersInCourse(response.data);
        setTotalItems(response.totalItems);

        setTotalPages(response.totalPages);
        setCurrentPage(response.currentPage);
        setIsInitialized(true);
        setHasNext(response.hasNext);
        setHasPrevious(response.hasPrevious);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load users";
        setError(errorMessage);
        setUsersInCourse([]);
        setTotalItems(0);
        setTotalPages(0);
        setHasNext(false);
        setHasPrevious(false);
      } finally {
        setIsLoading(false);
      }
    },
    [courseId, pageSize]
  );

  /**
   * Initialize users - call this when tab becomes active
   */
  const initializeUsers = useCallback(() => {
    if (!isInitialized) {
      console.log("Initializing users for course:", courseId);
      loadUsers(1, searchTerm, statusFilter);
    }
  }, [isInitialized, loadUsers, searchTerm, statusFilter, courseId]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback(
    (page: number) => {
      loadUsers(page, searchTerm, statusFilter);
    },
    [loadUsers, searchTerm, statusFilter]
  );

  /**
   * Handle page size change
   */
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      loadUsers(1, searchTerm, statusFilter);
    },
    [loadUsers, searchTerm, statusFilter]
  );

  /**
   * Handle search change
   */
  const handleSearchChange = useCallback(
    (keyword: string) => {
      setSearchTerm(keyword);
      loadUsers(1, keyword, statusFilter);
    },
    [loadUsers, statusFilter]
  );

  /**
   * Handle status filter change
   */
  const handleStatusFilterChange = useCallback(
    (isActive: boolean | undefined) => {
      setStatusFilter(isActive);
      loadUsers(1, searchTerm, isActive);
    },
    [loadUsers, searchTerm]
  );

  /**
   * Remove user from course
   */
  const removeUserFromCourse = useCallback(
    async (userId: number) => {
      if (!courseId) {
        throw new Error("courseId is required to remove user");
      }

      try {
        await userService.removeUserFromCourse(courseId, userId);
        // Reload current page after removing
        await loadUsers(currentPage, searchTerm, statusFilter);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove user from course";
        throw new Error(errorMessage);
      }
    },
    [courseId, currentPage, searchTerm, statusFilter, loadUsers]
  );

  /**
   * Refresh users (reload current page)
   */
  const refreshUsers = useCallback(() => {
    loadUsers(currentPage, searchTerm, statusFilter);
  }, [loadUsers, currentPage, searchTerm, statusFilter]);

  return {
    usersInCourse,
    isLoading,
    error,
    isInitialized,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNext,
    hasPrevious,
    initializeUsers,
    refreshUsers,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    handleStatusFilterChange,
    removeUserFromCourse,
  };
};
