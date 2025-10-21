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

  return { course, labs };
};
