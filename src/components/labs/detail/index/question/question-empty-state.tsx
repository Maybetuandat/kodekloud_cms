import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Plus, HelpCircle } from "lucide-react";

interface LabQuestionsEmptyStateProps {
  onCreateQuestion: () => void;
}

export function LabQuestionsEmptyState({
  onCreateQuestion,
}: LabQuestionsEmptyStateProps) {
  const { t } = useTranslation("labs");

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <HelpCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">
        {t("questions.noQuestions")}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {t("questions.noQuestionsDescription")}
      </p>
      <Button onClick={onCreateQuestion} className="gap-2">
        <Plus className="h-4 w-4" />
        {t("questions.createFirstQuestion")}
      </Button>
    </div>
  );
}
