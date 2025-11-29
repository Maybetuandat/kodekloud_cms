import { useState } from "react";
import { courseService } from "@/services/courseService";
import { Course, CreateCourseRequest } from "@/types/course";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export interface UseNewCoursePage {
  actionLoading: boolean;
  createCourse: (data: CreateCourseRequest) => Promise<Course>;
}

export const UseNewCoursePage = (): UseNewCoursePage => {
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const createCourse = async (data: CreateCourseRequest) => {
    console.log("Creating course with data:", data);
    const response = await courseService.createCourse(data);
    toast({ title: "tạo khoá học thành công" });
    if (response) {
      navigate(`/courses/${response.id}`);
    }
    return response;
  };

  return {
    createCourse,
    actionLoading,
  };
};
