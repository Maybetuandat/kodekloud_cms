import { BasicInfoFormData } from "@/components/courses/detail/overview-tab/edit-basic-info-modal";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/course";
import { useCallback, useEffect, useState } from "react";

export const useCourseOverview = (courseId: number) => {
  const [course, setCourse] = useState<Course>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch course details
   */
  const loadCourse = useCallback(async () => {
    if (!courseId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await courseService.getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load course";
      setError(errorMessage);
      console.error("Failed to fetch course details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  /**
   * Update course description
   */
  const updateDescription = async (newDescription: string) => {
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
  const updateBasicInfo = async (updatedCourse: BasicInfoFormData) => {
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

  // Load course on mount
  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  return {
    course,
    isLoading,
    error,
    updateDescription,
    updateBasicInfo,
    refreshCourse: loadCourse,
  };
};
