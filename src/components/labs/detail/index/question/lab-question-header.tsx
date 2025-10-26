// src/components/question/lab-question-header.tsx
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface LabQuestionsHeaderProps {
  onUploadExcel: () => void;
}

export function LabQuestionsHeader({ onUploadExcel }: LabQuestionsHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Questions</CardTitle>
        <div className="flex gap-2">
          <Button onClick={onUploadExcel} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Question
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
