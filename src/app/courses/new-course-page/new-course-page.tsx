// src/app/courses/new-course-page.tsx
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { CourseHeader } from "@/components/courses/course-header";
import { CourseForm } from "@/components/courses/course-form";
import { CreateCourseRequest } from "@/types/course";
import { useCoursePage } from "@/app/courses/index-page/use-course-page";

export default function NewCoursePage() {
  const { t } = useTranslation("courses");
  const navigate = useNavigate();
  const { createCourse, actionLoading } = useCoursePage();

  const handleCreateCourse = async (data: CreateCourseRequest) => {
    await createCourse(
      data,
      (newCourse) => {
        toast.success(t("courses.createSuccess", { name: newCourse.title }));
        navigate(`/courses`);
      },
      (error) => {
        console.error("Error creating course:", error);
        toast.error(error.message || t("courses.createError"));
        throw error; // Re-throw to prevent form from resetting
      }
    );
  };

  const handleCancel = () => {
    navigate("/courses");
  };

  return (
    <div className="min-h-screen w-full px-6 py-6 space-y-6">
      {/* Header */}
      <CourseHeader
        title={t("courses.createTitle")}
        description={t("courses.createDescription")}
        loading={actionLoading}
      />

      {/* Main Form Card */}
      <Card>
        <CardContent className="pt-6">
          <CourseForm
            onSubmit={handleCreateCourse}
            onCancel={handleCancel}
            loading={actionLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
