import { courseService } from "@/services/courseService";
import { labService } from "@/services/labService";
import { Lab, PaginatedResponse } from "@/types/lab";
import { useCallback, useState } from "react";

interface LabFilters {
  search: string;
  status: undefined | true | false;
  sortBy: "newest" | "oldest";
}

const initialFilters: LabFilters = {
  search: "",
  status: undefined,
  sortBy: "newest",
};

export const useCourseLabs = (courseId: number) => {
  // Labs in course
  const [labsInCourse, setLabsInCourse] = useState<Lab[]>([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [filters, setFilters] = useState<LabFilters>(initialFilters);
  const [error, setError] = useState<string | null>(null);

  // Available labs (not in this course)
  const [availableLabs, setAvailableLabs] = useState<Lab[]>([]);
  const [isLoadingAvailableLabs, setIsLoadingAvailableLabs] = useState(false);

  // Track if labs have been loaded at least once
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Load labs with pagination and filters
   */
  const loadLabs = useCallback(
    async (page = 1, customFilters?: Partial<LabFilters>): Promise<void> => {
      if (!courseId) {
        console.warn("courseId is required to load labs");
        return;
      }

      try {
        setIsLoadingLabs(true);
        setError(null);

        const activeFilters = customFilters
          ? { ...filters, ...customFilters }
          : filters;
        const isActive =
          activeFilters.status === undefined ? undefined : activeFilters.status;
        const search = activeFilters.search.trim() || undefined;

        const response: PaginatedResponse<Lab> =
          await labService.getLabsByCourseId(courseId, {
            page,
            pageSize,
            isActive,
            search,
          });

        setLabsInCourse(response.data);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
        setHasNext(response.hasNext);
        setHasPrevious(response.hasPrevious);
        setFilters(activeFilters);
        setIsInitialized(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load labs";
        setError(errorMessage);
        setLabsInCourse([]);
        setTotalPages(0);
        setTotalItems(0);
        setHasNext(false);
        setHasPrevious(false);
      } finally {
        setIsLoadingLabs(false);
      }
    },
    [courseId, filters, pageSize]
  );

  /**
   * Initialize labs - call this when tab becomes active
   */
  const initializeLabs = useCallback(() => {
    if (!isInitialized) {
      loadLabs(1);
    }
  }, [isInitialized, loadLabs]);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page - 1);
      loadLabs(page);
    },
    [loadLabs]
  );

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback(
    (newFilters: { search: string; status?: boolean }) => {
      const updatedFilters: LabFilters = {
        search: newFilters.search,
        status: newFilters.status,
        sortBy: filters.sortBy,
      };
      setFilters(updatedFilters);
      setCurrentPage(0);
      loadLabs(1, updatedFilters);
    },
    [loadLabs, filters.sortBy]
  );

  /**
   * Handle page size change
   */
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      handleFiltersChange({
        search: filters.search,
        status: filters.status,
      });
    },
    [filters.search, filters.status, handleFiltersChange]
  );

  /**
   * Fetch available labs (not in this course)
   */
  const fetchAvailableLabs = useCallback(async () => {
    setIsLoadingAvailableLabs(true);
    try {
      const allLabs = await labService.getLabsNotInCourse(courseId, {
        page: 1,
        pageSize: 1000,
      });

      console.log("Available labs fetched:", allLabs.data);
      setAvailableLabs(allLabs.data);
    } catch (error) {
      console.error("Failed to fetch available labs:", error);
    } finally {
      setIsLoadingAvailableLabs(false);
    }
  }, [courseId]);

  /**
   * Add labs to course
   */
  const addLabsToCourse = async (
    labIds: number[],
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    try {
      await courseService.addLabsToCourse(courseId, labIds);
      await loadLabs(currentPage);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add labs to course:", error);
      onError?.(error);
      throw error;
    }
  };

  /**
   * Remove lab from course
   */
  const removeLabFromCourse = async (
    labId: number,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    try {
      await courseService.removeLabFromCourse(courseId, labId);
      await loadLabs(currentPage);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to remove lab from course:", error);
      onError?.(error);
      throw error;
    }
  };

  return {
    // Data
    labsInCourse,
    isLoadingLabs,
    error,
    isInitialized,

    // Available labs
    availableLabs,
    isLoadingAvailableLabs,
    fetchAvailableLabs,

    // Pagination
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNext,
    hasPrevious,
    filters,

    // Actions
    initializeLabs,
    addLabsToCourse,
    removeLabFromCourse,
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange,
    refreshLabs: () => loadLabs(currentPage),
  };
};
