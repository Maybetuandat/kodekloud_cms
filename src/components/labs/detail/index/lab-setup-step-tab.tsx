import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SetupStep } from "@/types/setupStep";
import { useTranslation } from "react-i18next";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  FileCode,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface LabSetupStepsTabProps {
  setupSteps: SetupStep[];
  onCreateStep: () => void;
  onEditStep: (step: SetupStep) => void;
  onDeleteStep: (stepId: number) => void;
  onMoveStepUp: (stepId: number) => void;
  onMoveStepDown: (stepId: number) => void;
  isLoading: boolean;
}

export function LabSetupStepsTab({
  setupSteps,
  onCreateStep,
  onEditStep,
  onDeleteStep,
  onMoveStepUp,
  onMoveStepDown,
  isLoading,
}: LabSetupStepsTabProps) {
  const { t } = useTranslation(["labs", "common"]);
  const [deleteStepId, setDeleteStepId] = useState<number | null>(null);

  const handleDeleteClick = (stepId: number) => {
    setDeleteStepId(stepId);
  };

  const handleConfirmDelete = () => {
    if (deleteStepId !== null) {
      onDeleteStep(deleteStepId);
      setDeleteStepId(null);
    }
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {t("labs.setupSteps")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("labs.setupStepsDescription")}
              </p>
            </div>
            <Button onClick={onCreateStep} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("labs.addStep")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {setupSteps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileCode className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t("labs.noSetupSteps")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {t("labs.noSetupStepsDescription")}
              </p>
              <Button onClick={onCreateStep} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("labs.createFirstStep")}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {setupSteps.map((step, index) => (
                <Card
                  key={step.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Step Number */}
                      <div className="flex-shrink-0">
                        <Badge
                          variant="outline"
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                        >
                          {step.stepOrder}
                        </Badge>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1">
                              {step.title}
                            </h4>
                            {step.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {step.description}
                              </p>
                            )}
                            {step.setupCommand && (
                              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                <code>{step.setupCommand}</code>
                              </pre>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Move Up */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onMoveStepUp(step.id)}
                              disabled={index === 0}
                              className="h-8 w-8"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>

                            {/* Move Down */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onMoveStepDown(step.id)}
                              disabled={index === setupSteps.length - 1}
                              className="h-8 w-8"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>

                            {/* Edit */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditStep(step)}
                              className="h-8 w-8"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(step.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Info Tip */}
          {setupSteps.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">{t("labs.tip")}:</span>{" "}
                {t("labs.setupStepsTip")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteStepId !== null}
        onOpenChange={(open) => !open && setDeleteStepId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("setupSteps.deleteConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
