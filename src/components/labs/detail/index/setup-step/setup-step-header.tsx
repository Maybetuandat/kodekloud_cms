// components/labs/detail/setup-steps/setup-step-header.tsx
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SetupStepHeaderProps {
  onCreateClick: () => void;
  disabled?: boolean;
}

export function SetupStepHeader({
  onCreateClick,
  disabled = false,
}: SetupStepHeaderProps) {
  const { t } = useTranslation("labs");

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            {t("setupSteps.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t("setupSteps.description")}
          </p>
        </div>
        <Button onClick={onCreateClick} className="gap-2" disabled={disabled}>
          <Plus className="h-4 w-4" />
          {t("setupSteps.addStep")}
        </Button>
      </div>
    </CardHeader>
  );
}
