// components/labs/detail/setup-steps/setup-step-list.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SetupStep } from "@/types/setupStep";
import {
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  FileCode,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface SetupStepListProps {
  setupSteps: SetupStep[];
  onEdit: (step: SetupStep) => void;
  onDelete: (stepId: number) => void;
  onMoveUp: (stepId: number) => void;
  onMoveDown: (stepId: number) => void;
  onCreateClick: () => void;
  actionLoading?: boolean;
}

export function SetupStepList({
  setupSteps,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onCreateClick,
  actionLoading = false,
}: SetupStepListProps) {
  const { t } = useTranslation("labs");

  if (setupSteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileCode className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">
          {t("setupSteps.noSetupSteps")}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {t("setupSteps.noSetupStepsDescription")}
        </p>
        <Button
          onClick={onCreateClick}
          className="gap-2"
          disabled={actionLoading}
        >
          <Plus className="h-4 w-4" />
          {t("setupSteps.createFirstStep")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {setupSteps.map((step, index) => (
          <Card key={step.id} className="hover:shadow-md transition-shadow">
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
                        onClick={() => onMoveUp(step.id)}
                        disabled={index === 0 || actionLoading}
                        className="h-8 w-8"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>

                      {/* Move Down */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveDown(step.id)}
                        disabled={
                          index === setupSteps.length - 1 || actionLoading
                        }
                        className="h-8 w-8"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(step)}
                        disabled={actionLoading}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(step.id)}
                        disabled={actionLoading}
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

      {/* Info Tip */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">{t("tip")}:</span> {t("setupSteps.tip")}
        </p>
      </div>
    </>
  );
}
