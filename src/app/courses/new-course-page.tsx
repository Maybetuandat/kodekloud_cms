// src/app/courses/new-course-page.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { CourseHeader } from "@/components/courses/course-header";
import { CourseForm } from "@/components/courses/course-form";
import { CreateCourseRequest } from "@/types/course";
import { courseService } from "@/services/courseService";

export default function NewCoursePage() {
  const { t } = useTranslation("courses");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateCourse = async (data: CreateCourseRequest) => {
    setLoading(true);
    try {
      const newCourse = await courseService.createCourse(data);
      toast.success(t("courses.createSuccess", { name: newCourse.title }));

      // Navigate to course detail after success
      navigate(`/courses/${newCourse.id}`);
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(error.message || t("courses.createError"));
      throw error; // Re-throw to prevent form from resetting
    } finally {
      setLoading(false);
    }
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
        loading={loading}
      />

      {/* Main Form Card */}
      <Card>
        <CardContent className="pt-6">
          <CourseForm
            onSubmit={handleCreateCourse}
            onCancel={handleCancel}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
