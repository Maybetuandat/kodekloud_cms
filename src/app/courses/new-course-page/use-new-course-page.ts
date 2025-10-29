import { useState } from "react";
import { courseService } from "@/services/courseService";
import { Course, CreateCourseRequest } from "@/types/course";

export interface UseNewCoursePage {
  actionLoading: boolean;
  createCourse: (data: CreateCourseRequest) => Promise<Course>;
}

export const UseNewCoursePage = (): UseNewCoursePage => {
  const [actionLoading, setActionLoading] = useState(false);

  const createCourse = async (data: CreateCourseRequest) => {
    return await courseService.createCourse(data);
  };

  return {
    createCourse,
    actionLoading,
  };
};
