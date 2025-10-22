import { BasicInfoFormData } from "@/components/courses/detail/edit-basic-info-modal";
import { useLabPage, LabFilters } from "@/hooks/labs/use-lab-page";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/course";
import { useEffect, useState } from "react";

export const useCourseDetailPage = (courseId: number) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);

  // Use lab page hook với courseId
  const {
    labs,
    loading: isLoadingLabs,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    filters,
    createLab,
    updateLab,
    deleteLab,
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
    // When page size changes, reset to first page
    handleFiltersChange({
      ...filters,
    });
    // Note: The actual page size change logic should be in useLabPage hook
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

    // Pagination data
    currentPage,
    totalPages,
    totalItems,
    pageSize,

    // Course update functions
    updateDescriptionCourse,
    updateBasicInfoCourse,

    // Lab CRUD functions from useLabPage hook
    createLab,
    updateLab,
    deleteLab,
    toggleLabStatus,
    refreshLabs,

    // Pagination & Filter handlers
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange: handleLabFiltersChange,
  };
};
