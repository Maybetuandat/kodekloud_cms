import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FlaskConical } from "lucide-react";
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

  const handleTestClick = () => {
    console.log("Test setup steps clicked");
    // TODO: Implement test logic later
  };

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
        <div className="flex gap-2">
          <Button
            onClick={handleTestClick}
            variant="outline"
            className="gap-2"
            disabled={disabled}
          >
            <FlaskConical className="h-4 w-4" />
            Kiểm tra
          </Button>
          <Button onClick={onCreateClick} className="gap-2" disabled={disabled}>
            <Plus className="h-4 w-4" />
            Thêm bước thiết lập
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
