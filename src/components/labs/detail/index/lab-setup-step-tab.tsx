import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSetupSteps } from "@/app/labs/use-setup-step";
import { SetupStepDeleteDialog } from "./setup-step/setup-step-delete-dialog";
import { SetupStepFormDialog } from "./setup-step/setup-step-form-dialog";
import { SetupStepHeader } from "./setup-step/setup-step-header";
import { SetupStepList } from "./setup-step/setup-step-list";

interface LabSetupStepsTabProps {
  labId: number;
}

export function LabSetupStepsTab({ labId }: LabSetupStepsTabProps) {
  const { t } = useTranslation("labs");

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
    </>
  );
}
