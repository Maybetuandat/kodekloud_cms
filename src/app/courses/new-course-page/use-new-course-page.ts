import { useState } from "react";
import { courseService } from "@/services/courseService";
import { Course, CreateCourseRequest } from "@/types/course";

export interface UseNewCoursePage {
  actionLoading: boolean;
  createCourse: (
    data: CreateCourseRequest,
    subjectId: number
  ) => Promise<Course>;
}

export const UseNewCoursePage = (): UseNewCoursePage => {
  const [actionLoading, setActionLoading] = useState(false);

  const createCourse = async (data: CreateCourseRequest, subjectId: number) => {
    return await courseService.createCourse(data, subjectId);
  };

  return {
    createCourse,
    actionLoading,
  };
};
