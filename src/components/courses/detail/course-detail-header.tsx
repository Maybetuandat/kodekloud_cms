import { ArrowLeft, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryMap } from "@/constants/category-map";
import { Course } from "@/types/course";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  BasicInfoFormData,
  EditBasicInfoModal,
} from "./overview-tab/edit-basic-info-modal";

interface CourseDetailHeaderProps {
  course: Course;
  onEdit: (updateCourse: BasicInfoFormData) => void;
}

export function CourseDetailHeader({
  course,
  onEdit,
}: CourseDetailHeaderProps) {
  const { t } = useTranslation(["courses", "common"]);
  const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false);

  const handleBack = () => {
    window.history.back();
  };
  return (
    <div
      className={`bg-gradient-to-r from-gray-400 to-gray-600 text-white p-6 relative`}
    >
      {/* Edit Button - Top Right */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsEditBasicInfoOpen(true)}
        className="absolute top-4 right-4 gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
      >
        <Edit className="h-4 w-4" />
        {t("common.edit")}
      </Button>

      <button
        onClick={handleBack}
        className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t("courses.detail.backButton")}</span>
      </button>

      <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
      <p className="text-white/90 mb-4">{course.shortDescription}</p>

      <div className="flex gap-3 flex-wrap">
        {course.level ? (
          <Badge variant="secondary">{course.level.toLowerCase()}</Badge>
        ) : null}
      </div>
      {/* Edit Basic Info Modal */}
      <EditBasicInfoModal
        isOpen={isEditBasicInfoOpen}
        onClose={setIsEditBasicInfoOpen}
        onSubmit={onEdit}
        course={course}
      />
    </div>
  );
}
