import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { CourseHeader } from "@/components/courses/create-course/create-course-header";
import { CourseForm } from "@/components/courses/create-course/course-form";
import { CreateCourseRequest } from "@/types/course";

import { UseNewCoursePage } from "./use-new-course-page";

export default function NewCoursePage() {
  const { t } = useTranslation("courses");
  const navigate = useNavigate();
  const { createCourse, actionLoading } = UseNewCoursePage();

  const handleCreateCourse = async (data: CreateCourseRequest) => {
    await createCourse(data);
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
