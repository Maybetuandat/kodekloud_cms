import { CourseDetailHeader } from "@/components/courses/detail/course-detail-header";
import {
  BasicInfoFormData,
  EditBasicInfoModal,
} from "@/components/courses/detail/overview-tab/edit-basic-info-modal";
import { CourseLabsTab } from "@/components/courses/detail/lab-tab/lab-tabs";
import { CourseOverviewTab } from "@/components/courses/detail/overview-tab/overview-tab";
import { SelectLabsDialog } from "@/components/courses/detail/lab-tab/select-labs-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/types/course";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useCourseDetailPage } from "./use-course-detail";

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useTranslation(["courses", "common"]);

  const [isSelectLabsOpen, setIsSelectLabsOpen] = useState(false);
  const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false);
  const [isAddingLabs, setIsAddingLabs] = useState(false);

  const {
    course,
    isLoadingCourse,
    labsInCourse,
    isLoadingLabs,
    availableLabs,
    isLoadingAvailableLabs,
    fetchAvailableLabs,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    updateDescriptionCourse,
    updateBasicInfoCourse,
    addLabsToCourse,
    removeLabFromCourse,
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange,
  } = useCourseDetailPage(Number(courseId));

  const safeCourse: Course = course || {
    id: 0,
    title: "",
    description: "",
    level: "",
    durationMinutes: 0,
    updatedAt: "",
    shortDescription: "",
    isActive: false,
    labs: [],
    category: {
      id: 0,
      title: "",
      description: "",
      slug: "",
      createdAt: "",
      updatedAt: "",
    },
    listCourseUser: [],
  };

  const handleRemoveLabFromCourse = async (labId: number) => {
    removeLabFromCourse(
      labId,
      () => {
        console.log("Lab removed from course successfully");
      },
      (error) => {
        console.error("Failed to remove lab from course:", error);
      }
    );
  };

  const handleOpenSelectLabs = async () => {
    await fetchAvailableLabs();
    setIsSelectLabsOpen(true);
  };

  const handleAddLabsToCourse = async (labIds: number[]) => {
    setIsAddingLabs(true);
    try {
      await addLabsToCourse(
        labIds,
        () => {
          setIsSelectLabsOpen(false);
        },
        (error) => {
          console.error("Failed to add labs to course:", error);
          throw error;
        }
      );
    } catch (error) {
    } finally {
      setIsAddingLabs(false);
    }
  };

  const handleSaveDescription = (description: string) => {
    updateDescriptionCourse(description);
  };

  const handleSaveBasicInfo = (data: BasicInfoFormData) => {
    updateBasicInfoCourse(data);
  };

  const onBack = () => window.history.back();

  // Show loading state
  if (isLoadingCourse) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CourseDetailHeader
        course={safeCourse}
        onEdit={() => setIsEditBasicInfoOpen(true)}
        onBack={onBack}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="overview">
              {t("courses.detail.tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="labs">
              {t("courses.detail.tabs.labs")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <CourseOverviewTab
              description={safeCourse.description ?? ""}
              onSaveDescription={handleSaveDescription}
            />
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="mt-6">
            <CourseLabsTab
              labs={labsInCourse}
              courseId={safeCourse.id}
              onAddLabs={handleOpenSelectLabs}
              onRemoveLab={handleRemoveLabFromCourse}
              isLoading={isLoadingLabs}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onFiltersChange={handleFiltersChange}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Select Labs Dialog */}
      <SelectLabsDialog
        open={isSelectLabsOpen}
        onOpenChange={setIsSelectLabsOpen}
        onConfirm={handleAddLabsToCourse}
        availableLabs={availableLabs}
        loading={isLoadingAvailableLabs}
        isSubmitting={isAddingLabs}
      />

      {/* Edit Basic Info Modal */}
      <EditBasicInfoModal
        isOpen={isEditBasicInfoOpen}
        onClose={() => setIsEditBasicInfoOpen(false)}
        onSubmit={handleSaveBasicInfo}
        course={safeCourse}
      />
    </div>
  );
}
