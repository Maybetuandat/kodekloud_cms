// app/courses/detail-page/user-tab/use-user-tab.ts
import { leaderboardService } from "@/services/leaderboardService";
import { LeaderboardEntry } from "@/types/leaderboard";
import { useState, useCallback, useEffect } from "react";
import { userService } from "@/services/userService";

export const useCourseUsers = (courseId: number) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadLeaderboard = useCallback(async () => {
    if (!courseId) return;

    try {
      setIsLoadingLeaderboard(true);
      const data = await leaderboardService.getLeaderboardByCourse(courseId);

      // Calculate pagination
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = data.slice(start, end);

      setLeaderboard(paginatedData);
      setTotalItems(data.length);
      setTotalPages(Math.ceil(data.length / pageSize));
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      setError("Failed to load leaderboard");
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [courseId, currentPage, pageSize]);

  const initializeUsers = useCallback(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      loadLeaderboard();
    }
  }, [isInitialized, loadLeaderboard]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const removeUserFromCourse = useCallback(
    async (userId: number) => {
      if (!courseId) {
        throw new Error("courseId is required to remove user");
      }

      try {
        await userService.removeUserFromCourse(courseId, userId);
        await loadLeaderboard();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove user from course";
        throw new Error(errorMessage);
      }
    },
    [courseId, loadLeaderboard]
  );

  const refreshUsers = useCallback(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    if (isInitialized) {
      loadLeaderboard();
    }
  }, [isInitialized, loadLeaderboard]);

  return {
    leaderboard,
    isLoadingLeaderboard,
    error,
    isInitialized,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    initializeUsers,
    refreshUsers,
    handlePageChange,
    handlePageSizeChange,
    removeUserFromCourse,
  };
};
