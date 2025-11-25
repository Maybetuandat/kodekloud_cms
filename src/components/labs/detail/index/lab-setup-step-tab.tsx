import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSetupSteps } from "@/app/labs/detail-page/use-setup-step";
import { SetupStepDeleteDialog } from "./setup-step/setup-step-delete-dialog";
import { SetupStepFormDialog } from "./setup-step/setup-step-form-dialog";

import { SetupStepList } from "./setup-step/setup-step-list";

import { useState } from "react";
import { TestDialog } from "../test";
import { SetupStepHeader } from "./setup-step/setup-step-header";

interface LabSetupStepsTabProps {
  labId: number;
  labTitle: string;
}

export function LabSetupStepsTab({ labId, labTitle }: LabSetupStepsTabProps) {
  const { t } = useTranslation("labs");
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  const {
    setupSteps,
    isLoading,
    actionLoading,
    deleteStepId,
    editingStep,
    isCreateDialogOpen,
    handleCreateClick,
    handleEditClick,
    handleMoveStepUp,
    handleMoveStepDown,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleCreateSetupStep,
    handleUpdateSetupStep,
    handleCloseCreateDialog,
    handleCloseEditDialog,
  } = useSetupSteps({ labId });

  const handleTestClick = () => {
    setIsTestDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleFormSubmit = async (data: any) => {
    if (editingStep) {
      await handleUpdateSetupStep({
        id: editingStep.id,
        ...data,
      });
    } else {
      await handleCreateSetupStep(data);
    }
  };

  return (
    <>
      <Card>
        <SetupStepHeader
          onCreateClick={handleCreateClick}
          onTestClick={handleTestClick}
          disabled={actionLoading}
        />
        <CardContent>
          <SetupStepList
            setupSteps={setupSteps}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onMoveUp={handleMoveStepUp}
            onMoveDown={handleMoveStepDown}
            onCreateClick={handleCreateClick}
            actionLoading={actionLoading}
          />
        </CardContent>
      </Card>

      <SetupStepFormDialog
        open={isCreateDialogOpen || editingStep !== null}
        onOpenChange={(open) => {
          if (!open) {
            if (editingStep) {
              handleCloseEditDialog();
            } else {
              handleCloseCreateDialog();
            }
          }
        }}
        onSubmit={handleFormSubmit}
        editingStep={editingStep}
        loading={actionLoading}
      />

      <SetupStepDeleteDialog
        open={deleteStepId !== null}
        onOpenChange={(open) => !open && handleCancelDelete()}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <TestDialog
        open={isTestDialogOpen}
        onOpenChange={setIsTestDialogOpen}
        labId={labId}
        labTitle={labTitle}
      />
    </>
  );
}
