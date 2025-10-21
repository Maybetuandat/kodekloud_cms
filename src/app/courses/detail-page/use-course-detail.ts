import { BasicInfoFormData } from "@/components/courses/edit-basic-info-modal";
import { courseService } from "@/services/courseService";
import { Course } from "@/types/course";
import { Lab } from "@/types/lab";

import { useEffect, useState } from "react";

export const useCourseDetailPage = (courseId: number) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      }
    };

    fetchCourse();
  }, [courseId]);

  const updateDescriptionCourse = async (newDescription: string) => {
    if (course) {
      course.description = newDescription;
      const response = await courseService.updateCourse(courseId, course);
      console.log(response);
      setCourse(response);
    }
  };
  const updateBasicInfoCourse = async (updatedCourse: BasicInfoFormData) => {
    if (course) {
      if (updatedCourse.title !== undefined) {
        course.title = updatedCourse.title;
      }
      if (updatedCourse.shortDescription !== undefined) {
        course.shortDescription = updatedCourse.shortDescription;
      }
      if (updatedCourse.level !== undefined) {
        course.level = updatedCourse.level;
      }
      if (updatedCourse.durationMinutes !== undefined) {
        course.durationMinutes = updatedCourse.durationMinutes;
      }
      const response = await courseService.updateCourse(courseId, course);
      setCourse(response);
    }
  };

  return { course, labs, updateDescriptionCourse, updateBasicInfoCourse };
};
