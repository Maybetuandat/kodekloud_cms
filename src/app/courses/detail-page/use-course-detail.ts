import { BasicInfoFormData } from "@/components/courses/detail/overview-tab/edit-basic-info-modal";
import { useLabPage } from "@/hooks/labs/use-lab";
import { courseService } from "@/services/courseService";
import { labService } from "@/services/labService";
import { Course } from "@/types/course";
import { Lab } from "@/types/lab";
import { useEffect, useState } from "react";

export const useCourseDetailPage = (courseId: number) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);

  // Available labs (not in this course)
  const [availableLabs, setAvailableLabs] = useState<Lab[]>([]);
  const [isLoadingAvailableLabs, setIsLoadingAvailableLabs] = useState(false);

  // Use lab page hook với courseId (labs in course)
  const {
    labs,
    loading: isLoadingLabs,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    filters,
    toggleLabStatus,
    handlePageChange,
    handleFiltersChange,
    refresh: refreshLabs,
  } = useLabPage({
    courseId,
    autoLoad: true,
  });

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

  /**
   * Fetch available labs (not in this course)
   */
  const fetchAvailableLabs = async () => {
    setIsLoadingAvailableLabs(true);
    try {
      // Fetch all labs without courseId filter
      const allLabs = await labService.getLabsPaginated({
        page: 0,
        size: 1000, // Get all labs
      });

      // Filter out labs already in course
      const currentLabIds = labs.map((lab) => lab.id);
      const available = allLabs.data.filter(
        (lab) => !currentLabIds.includes(lab.id)
      );

      setAvailableLabs(available);
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
      // Call API to add labs to course
      await courseService.addLabsToCourse(courseId, labIds);

      // Refresh labs list
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
      // Call API to remove lab from course
      await courseService.removeLabFromCourse(courseId, labId);

      // Refresh labs list
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
    handleFiltersChange({
      ...filters,
    });
  };

  /**
   * Wrapper for filters change to match CourseLabsTab interface
   */
  const handleLabFiltersChange = (newFilters: {
    search: string;
    status?: boolean;
  }) => {
    handleFiltersChange({
      search: newFilters.search,
      status: newFilters.status,
      sortBy: filters.sortBy,
    });
  };

  return {
    // Course data
    course,
    isLoadingCourse,

    // Labs data from useLabPage hook
    labs,
    isLoadingLabs,

    // Available labs
    availableLabs,
    isLoadingAvailableLabs,
    fetchAvailableLabs,

    // Pagination data
    currentPage,
    totalPages,
    totalItems,
    pageSize,

    // Course update functions
    updateDescriptionCourse,
    updateBasicInfoCourse,

    // Lab management functions
    addLabsToCourse,
    removeLabFromCourse,
    toggleLabStatus,
    refreshLabs,

    // Pagination & Filter handlers
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange: handleLabFiltersChange,
  };
};
