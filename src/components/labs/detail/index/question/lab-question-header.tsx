import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

interface LabQuestionsHeaderProps {
  onCreateQuestion: () => void;
}

export function LabQuestionsHeader({
  onCreateQuestion,
}: LabQuestionsHeaderProps) {
  const { t } = useTranslation("labs");

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            {t("questions.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {t("questions.description")}
          </p>
        </div>
        <Button onClick={onCreateQuestion} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("questions.addQuestion")}
        </Button>
      </div>
    </CardHeader>
  );
}
