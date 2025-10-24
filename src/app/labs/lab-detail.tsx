import { LabFormDialog } from "@/components/labs/index/lab-form-dialog";
import { LabDeleteDialog } from "@/components/labs/index/lab-delete-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateLabRequest } from "@/types/lab";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { Question } from "@/types/question";
import { LabDetailHeader } from "../../components/labs/detail/index/lab-detail-header";
import { LabInfoSection } from "../../components/labs/detail/index/lab-info-section";
import { LabQuestionsTab } from "../../components/labs/detail/index/lab-question-tab";
import { LabSetupStepsTab } from "../../components/labs/detail/index/lab-setup-step-tab";
import { QuestionFilters, useLabDetailPage } from "./use-lab-detail-page";

export function LabDetail() {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["labs", "common"]);

  const [isEditLabOpen, setIsEditLabOpen] = useState(false);
  const [isDeleteLabOpen, setIsDeleteLabOpen] = useState(false);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const { lab, isLoadingLab, updateLab, toggleLabStatus, deleteLab } =
    useLabDetailPage(Number(labId));

  // Handle Lab Operations
  const handleUpdateLab = async (data: UpdateLabRequest) => {
    try {
      await updateLab(data);
      setIsEditLabOpen(false);
      toast.success(t("labs.updateSuccess", { name: data.title }));
    } catch (error) {
      toast.error(t("labs.updateError"));
    }
  };

  const handleToggleLabStatus = async () => {
    try {
      await toggleLabStatus();
      const newStatus = !lab?.isActive;
      toast.success(
        t("labs.toggleStatusSuccess", {
          name: lab?.title,
          status: newStatus ? t("common.activated") : t("common.deactivated"),
        })
      );
    } catch (error) {
      toast.error(t("labs.toggleStatusError"));
    }
  };

  const handleDeleteLab = async () => {
    const labTitle = lab?.title ?? "";
    try {
      await deleteLab(
        () => {
          toast.success(t("labs.deleteSuccess", { name: labTitle }));
          navigate("/labs");
        },
        (error) => {
          toast.error(t("labs.deleteError"));
        }
      );
    } catch (error) {
      // Error already handled in callback
    }
  };

  const onBack = () => window.history.back();

  // Show loading state
  if (isLoadingLab) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!lab) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t("labs.notFound")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("labs.notFoundDescription")}
          </p>
          <button
            onClick={() => navigate("/labs")}
            className="text-primary hover:underline"
          >
            {t("labs.backToList")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <LabDetailHeader
        lab={lab}
        onEdit={() => setIsEditLabOpen(true)}
        onDelete={() => setIsDeleteLabOpen(true)}
        onToggleStatus={handleToggleLabStatus}
        onBack={onBack}
      />

      {/* Lab Info Section */}
      <div className="px-6 pt-6">
        <LabInfoSection lab={lab} />
      </div>

      {/* Content with Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="setup-steps" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-auto">
            <TabsTrigger value="setup-steps">
              {t("setupSteps.title")}
            </TabsTrigger>
            <TabsTrigger value="questions">{t("questions.title")}</TabsTrigger>
          </TabsList>

          {/* Setup Steps Tab */}
          <TabsContent value="setup-steps" className="mt-6">
            <LabSetupStepsTab labId={Number(labId)} />
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-6">
            <LabQuestionsTab labId={Number(labId)} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Lab Modal */}
      <LabFormDialog
        open={isEditLabOpen}
        onOpenChange={setIsEditLabOpen}
        lab={lab}
        onSubmit={handleUpdateLab}
        loading={false}
      />

      {/* Delete Lab Modal */}
      <LabDeleteDialog
        open={isDeleteLabOpen}
        onOpenChange={setIsDeleteLabOpen}
        lab={lab}
        onConfirm={handleDeleteLab}
        loading={false}
      />
    </div>
  );
}
