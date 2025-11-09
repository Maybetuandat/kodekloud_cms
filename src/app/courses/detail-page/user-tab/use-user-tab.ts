import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { useState, useCallback, useEffect } from "react";

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

  const loadUsers = useCallback(async () => {
    if (!courseId) {
      console.warn("courseId is required to load users");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await userService.getUsersInCoursePaginated(
        {
          page: currentPage,
          pageSize: pageSize,
          search: searchTerm,
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
  }, [courseId, pageSize, searchTerm, currentPage]);

  const initializeUsers = useCallback(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      loadUsers();
    }
  }, [isInitialized, loadUsers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearchChange = (keyword: string) => {
    setSearchTerm(keyword);
  };

  const removeUserFromCourse = useCallback(
    async (userId: number) => {
      if (!courseId) {
        throw new Error("courseId is required to remove user");
      }

      try {
        await userService.removeUserFromCourse(courseId, userId);
        await loadUsers();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove user from course";
        throw new Error(errorMessage);
      }
    },
    [courseId, currentPage, loadUsers]
  );
  const refreshUsers = useCallback(() => {
    loadUsers();
  }, [loadUsers]);
  useEffect(() => {
    if (isInitialized) {
      loadUsers();
    }
  }, [courseId, currentPage, pageSize, searchTerm, loadUsers, isInitialized]);

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
    removeUserFromCourse,
  };
};
