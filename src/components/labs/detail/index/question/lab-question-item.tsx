import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Question {
  id: number;
  // Add other question properties here
}

interface LabQuestionItemProps {
  question: Question;
  index: number;
  onEdit: (questionId: number) => void;
  onDelete: (questionId: number) => void;
}

export function LabQuestionItem({
  question,
  index,
  onEdit,
  onDelete,
}: LabQuestionItemProps) {
  const { t } = useTranslation("labs");

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Question Number */}
          <div className="flex-shrink-0">
            <Badge
              variant="outline"
              className="h-8 w-8 rounded-full flex items-center justify-center"
            >
              {index}
            </Badge>
          </div>

          {/* Question Content - Add your content here */}
          <div className="flex-1">
            {/* TODO: Add question content */}
            <p className="text-sm text-muted-foreground">
              Question ID: {question.id}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(question.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(question.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
