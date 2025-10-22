import { CourseDetailHeader } from "@/components/courses/detail/course-detail-header";
import {
  BasicInfoFormData,
  EditBasicInfoModal,
} from "@/components/courses/detail/edit-basic-info-modal";
import { CourseLabsTab } from "@/components/courses/detail/lab-tabs";
import { CourseOverviewTab } from "@/components/courses/detail/overview-tab";
import { LabFormDialog } from "@/components/labs/index/lab-form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/types/course";
import { CreateLabRequest, UpdateLabRequest } from "@/types/lab";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useCourseDetailPage } from "./use-course-detail";

export function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(["courses", "common"]);

  const [isCreateLabOpen, setIsCreateLabOpen] = useState(false);
  const [isEditBasicInfoOpen, setIsEditBasicInfoOpen] = useState(false);
  const [isCreatingLab, setIsCreatingLab] = useState(false);

  const {
    course,
    isLoadingCourse,
    labs,
    isLoadingLabs,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    updateDescriptionCourse,
    updateBasicInfoCourse,
    createLab,
    deleteLab,
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange,
  } = useCourseDetailPage(Number(id));

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

  const handleDeleteLab = (labId: string) => {
    deleteLab(
      labId,
      () => {
        console.log("Lab deleted successfully");
      },
      (error) => {
        console.error("Failed to delete lab:", error);
      }
    );
  };

  const handleCreateLab = async (data: CreateLabRequest | UpdateLabRequest) => {
    setIsCreatingLab(true);
    try {
      await createLab(
        data,
        (newLab) => {
          console.log("Lab created successfully:", newLab);
          setIsCreateLabOpen(false);
        },
        (error) => {
          console.error("Failed to create lab:", error);
          throw error;
        }
      );
    } catch (error) {
      // Error already logged in callback
    } finally {
      setIsCreatingLab(false);
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
              labs={labs}
              onCreateLab={() => setIsCreateLabOpen(true)}
              onDeleteLab={handleDeleteLab}
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

      {/* Create Lab Modal */}
      <LabFormDialog
        open={isCreateLabOpen}
        onOpenChange={setIsCreateLabOpen}
        onSubmit={handleCreateLab}
        loading={isCreatingLab}
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
