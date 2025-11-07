import { userService } from "@/services/userService";
import { User } from "@/types/user";
import { set } from "date-fns";
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

  /**
   * Load users in course
   */
  const loadUsers = useCallback(
    async (page: number) => {
      if (!courseId) {
        console.warn("courseId is required to load users");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await userService.getUsersInCoursePaginated(
          { page: page, pageSize: pageSize },
          courseId
        );
        setUsersInCourse(response.data);
        setTotalItems(response.totalItems);
        setTotalPages(response.totalPages);
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
    [courseId]
  );

  /**
   * Initialize users - call this when tab becomes active
   */
  const initializeUsers = useCallback(() => {
    if (!isInitialized) {
      console.log("Initializing users for course:", courseId);
      loadUsers(1);
    }
  }, [isInitialized, loadUsers]);
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      loadUsers(page);
    },
    [loadUsers]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
      loadUsers(1);
    },
    [loadUsers]
  );
  return {
    usersInCourse,
    isLoading,
    error,
    isInitialized,
    initializeUsers,
    refreshUsers: loadUsers,
  };
};
