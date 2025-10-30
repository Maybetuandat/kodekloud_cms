import { BasicInfoFormData } from "@/components/courses/detail/overview-tab/edit-basic-info-modal";
import { courseService } from "@/services/courseService";
import { labService } from "@/services/labService";
import { Course } from "@/types/course";
import { Lab, PaginatedResponse } from "@/types/lab";
import { useCallback, useEffect, useState } from "react";

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

export const useCourseDetailPage = (courseId: number) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);

  // Available labs (not in this course)
  const [availableLabs, setAvailableLabs] = useState<Lab[]>([]);
  const [isLoadingAvailableLabs, setIsLoadingAvailableLabs] = useState(false);

  // Labs in course - state from useLabPage
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

  /**
   * Load labs with pagination and filters (from useLabPage)
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
            page, // Gửi 1-based page (backend sẽ trừ 1)
            pageSize,
            isActive,
            search,
          });

        setLabsInCourse(response.data);
        setCurrentPage(response.currentPage); // Backend trả về 0-based
        setTotalPages(response.totalPages);
        setTotalItems(response.totalItems);
        setHasNext(response.hasNext);
        setHasPrevious(response.hasPrevious);
        setFilters(activeFilters);
        setIsLoadingLabs(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load labs";
        setError(errorMessage);
        setLabsInCourse([]);
        setTotalPages(0);
        setTotalItems(0);
        setHasNext(false);
        setHasPrevious(false);
        setIsLoadingLabs(false);
      }
    },
    [courseId, filters, pageSize]
  );

  /**
   * Handle page change (from useLabPage)
   */
  const handlePageChange = useCallback(
    (page: number) => {
      // page từ Pagination component là 1-based
      setCurrentPage(page - 1); // Chuyển về 0-based để lưu state
      loadLabs(page); // Gửi 1-based đến API
    },
    [loadLabs]
  );

  /**
   * Handle filter changes (from useLabPage)
   */
  const handleFiltersChange = useCallback(
    (newFilters: { search: string; status?: boolean }) => {
      const updatedFilters: LabFilters = {
        search: newFilters.search,
        status: newFilters.status,
        sortBy: filters.sortBy,
      };
      setFilters(updatedFilters);
      setCurrentPage(0); // Reset về page 0 (0-based)
      loadLabs(1, updatedFilters); // Gọi API với page 1 (1-based)
    },
    [loadLabs, filters.sortBy]
  );

  const refreshLabs = useCallback((): void => {
    loadLabs(currentPage);
  }, [loadLabs, currentPage]);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoadingCourse(true);
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setIsLoadingCourse(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Initial load labs on mount
  useEffect(() => {
    if (courseId) {
      loadLabs();
    }
    if (courseId) {
      fetchAvailableLabs();
    }
  }, [courseId]);

  /**
   * Fetch available labs (not in this course)
   */
  const fetchAvailableLabs = async () => {
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
  };

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
      await refreshLabs();
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
      await refreshLabs();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to remove lab from course:", error);
      onError?.(error);
      throw error;
    }
  };

  /**
   * Update course description
   */
  const updateDescriptionCourse = async (newDescription: string) => {
    if (!course) return;

    try {
      const updatedCourse = {
        ...course,
        description: newDescription,
      };

      const response = await courseService.updateCourse(
        courseId,
        updatedCourse
      );
      setCourse(response);
    } catch (error) {
      console.error("Failed to update course description:", error);
      throw error;
    }
  };

  /**
   * Update course basic info
   */
  const updateBasicInfoCourse = async (updatedCourse: BasicInfoFormData) => {
    if (!course) return;

    try {
      const courseToUpdate = { ...course };

      if (updatedCourse.title !== undefined) {
        courseToUpdate.title = updatedCourse.title;
      }
      if (updatedCourse.shortDescription !== undefined) {
        courseToUpdate.shortDescription = updatedCourse.shortDescription;
      }
      if (updatedCourse.level !== undefined) {
        courseToUpdate.level = updatedCourse.level;
      }
      if (updatedCourse.durationMinutes !== undefined) {
        courseToUpdate.durationMinutes = updatedCourse.durationMinutes;
      }

      const response = await courseService.updateCourse(
        courseId,
        courseToUpdate
      );
      setCourse(response);
    } catch (error) {
      console.error("Failed to update course basic info:", error);
      throw error;
    }
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (newPageSize: number) => {
    // Currently not implemented - pageSize is fixed
    // Can be extended if needed
    handleFiltersChange({
      search: filters.search,
      status: filters.status,
    });
  };

  return {
    // Course data
    course,
    isLoadingCourse,

    // Labs data
    labsInCourse,
    isLoadingLabs,
    error,

    // Available labs
    availableLabs,
    isLoadingAvailableLabs,
    fetchAvailableLabs,

    // Pagination data
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNext,
    hasPrevious,
    filters,

    // Course update functions
    updateDescriptionCourse,
    updateBasicInfoCourse,

    // Lab management functions
    addLabsToCourse,
    removeLabFromCourse,

    refreshLabs,

    // Pagination & Filter handlers
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange,
  };
};
