import { useState } from "react";
import { courseService } from "@/services/courseService";
import { Course, CreateCourseRequest } from "@/types/course";

export interface UseNewCoursePage {
  actionLoading: boolean;
  createCourse: (data: CreateCourseRequest) => Promise<void>;
}

export const UseNewCoursePage = (): UseNewCoursePage => {
  const [actionLoading, setActionLoading] = useState(false);

  const createCourse = async (data: CreateCourseRequest) => {
    console.log("Creating course with data:", data);
    const response = await courseService.createCourse(data);
    console.log("Course created successfully:", response);
  };

  return {
    createCourse,
    actionLoading,
  };
};
