// app/courses/detail-page/user-tab/use-user-tab.ts
import { userService } from "@/services/userService";
import { leaderboardService } from "@/services/leaderboardService";
import { User } from "@/types/user";
import { LeaderboardEntry } from "@/types/leaderboard";
import { useState, useCallback, useEffect } from "react";

export const useCourseUsers = (courseId: number) => {
  const [usersInCourse, setUsersInCourse] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadLeaderboard = useCallback(async () => {
    if (!courseId) return;

    try {
      setIsLoadingLeaderboard(true);
      const data = await leaderboardService.getLeaderboardByCourse(courseId);
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [courseId]);

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
      loadLeaderboard();
    }
  }, [isInitialized, loadUsers, loadLeaderboard]);

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
        await loadLeaderboard();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove user from course";
        throw new Error(errorMessage);
      }
    },
    [courseId, loadUsers, loadLeaderboard]
  );

  const refreshUsers = useCallback(() => {
    loadUsers();
    loadLeaderboard();
  }, [loadUsers, loadLeaderboard]);

  useEffect(() => {
    if (isInitialized) {
      loadUsers();
    }
  }, [courseId, currentPage, pageSize, searchTerm, loadUsers, isInitialized]);

  return {
    usersInCourse,
    leaderboard,
    isLoading,
    isLoadingLeaderboard,
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
