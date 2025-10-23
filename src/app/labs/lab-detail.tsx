import { LabFormDialog } from "@/components/labs/index/lab-form-dialog";
import { LabDeleteDialog } from "@/components/labs/index/lab-delete-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lab, UpdateLabRequest } from "@/types/lab";
import {
  CreateSetupStepRequest,
  UpdateSetupStepRequest,
  SetupStep,
} from "@/types/setupStep";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { Question } from "@/types/question";
import { LabDetailHeader } from "../../components/labs/detail/index/lab-detail-header";
import { LabInfoSection } from "../../components/labs/detail/index/lab-info-section";
import { LabQuestionsTab } from "../../components/labs/detail/index/lab-question-tab";
import { LabSetupStepsTab } from "../../components/labs/detail/index/lab-setup-step-tab";
import { QuestionFilters, useLabDetailPage } from "./use-lab-detail-page";
import { useSetupSteps } from "@/hooks/setup-steps/use-setup-step";

export function LabDetail() {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["labs", "common"]);

  const [isEditLabOpen, setIsEditLabOpen] = useState(false);
  const [isDeleteLabOpen, setIsDeleteLabOpen] = useState(false);
  const [isCreateSetupStepOpen, setIsCreateSetupStepOpen] = useState(false);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [editingSetupStep, setEditingSetupStep] = useState<SetupStep | null>(
    null
  );
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const {
    lab,
    isLoadingLab,

    isLoadingSetupSteps,
    questions,
    isLoadingQuestions,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    updateLab,
    toggleLabStatus,
    deleteLab,
    createSetupStep,
    updateSetupStep,
    deleteSetupStep,
    moveSetupStepUp,
    moveSetupStepDown,
  } = useLabDetailPage(Number(labId));
  const { setupSteps } = useSetupSteps({ labId: Number(labId) });

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

  const handleDeleteSetupStep = async (stepId: number) => {
    try {
      await deleteSetupStep(
        stepId,
        () => {
          toast.success(t("labs.setupStepDeleteSuccess"));
        },
        (error) => {
          toast.error(t("labs.setupStepDeleteError"));
        }
      );
    } catch (error) {
      // Error already handled
    }
  };

  const handleMoveStepUp = async (stepId: number) => {
    try {
      await moveSetupStepUp(stepId);
      toast.success(t("labs.moveStepUpSuccess"));
    } catch (error) {
      toast.error(t("labs.moveStepError"));
    }
  };

  const handleMoveStepDown = async (stepId: number) => {
    try {
      await moveSetupStepDown(stepId);
      toast.success(t("labs.moveStepDownSuccess"));
    } catch (error) {
      toast.error(t("labs.moveStepError"));
    }
  };

  // Handle Question Operations

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

  function handleDeleteQuestion(questionId: number): void {
    throw new Error("Function not implemented.");
  }

  function handlePageChange(page: number): void {
    throw new Error("Function not implemented.");
  }

  function handlePageSizeChange(size: number): void {
    throw new Error("Function not implemented.");
  }

  function handleFiltersChange(filters: Partial<QuestionFilters>): void {
    throw new Error("Function not implemented.");
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
              {t("labs.detail.tabs.setupSteps")}
            </TabsTrigger>
            <TabsTrigger value="questions">
              {t("labs.detail.tabs.questions")}
            </TabsTrigger>
          </TabsList>

          {/* Setup Steps Tab */}
          <TabsContent value="setup-steps" className="mt-6">
            <LabSetupStepsTab
              setupSteps={setupSteps}
              onCreateStep={() => setIsCreateSetupStepOpen(true)}
              onEditStep={(step) => {
                setEditingSetupStep(step);
              }}
              onDeleteStep={handleDeleteSetupStep}
              onMoveStepUp={handleMoveStepUp}
              onMoveStepDown={handleMoveStepDown}
              isLoading={isLoadingSetupSteps}
            />
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="mt-6">
            <LabQuestionsTab
              questions={questions}
              onCreateQuestion={() => setIsCreateQuestionOpen(true)}
              onEditQuestion={(question) => {
                setEditingQuestion(question);
              }}
              onDeleteQuestion={handleDeleteQuestion}
              isLoading={isLoadingQuestions}
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

      {/* Setup Step Form Modal */}
    </div>
  );
}
