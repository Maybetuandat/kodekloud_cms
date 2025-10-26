// src/components/question/lab-question-item.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { answerService } from "@/services/answerService";
import { Answer } from "@/types/answer";

interface Question {
  id: number;
  question: string;
  hint: string;
  solution: string;
  createdAt: string;
  updatedAt: string;
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
  const [expanded, setExpanded] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  // Load answers when expanded
  useEffect(() => {
    if (expanded && answers.length === 0) {
      loadAnswers();
    }
  }, [expanded]);

  const loadAnswers = async () => {
    setLoadingAnswers(true);
    try {
      const data = await answerService.getAnswersByQuestionId(question.id);
      setAnswers(data);
    } catch (error) {
      console.error("Failed to load answers:", error);
    } finally {
      setLoadingAnswers(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Question Header */}
          <div className="flex items-start gap-4">
            {/* Question Number */}
            <Badge variant="outline" className="shrink-0 mt-1">
              Q{index}
            </Badge>

            {/* Question Content */}
            <div className="flex-1 space-y-2">
              <div className="font-medium text-base">{question.question}</div>

              {/* Hint */}
              {question.hint && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">💡 Hint:</span> {question.hint}
                </div>
              )}

              {/* Solution (collapsed by default) */}
              {expanded && question.solution && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">📝 Solution:</span>{" "}
                  {question.solution}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(!expanded)}
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(question.id)}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(question.id)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Answers Section (shown when expanded) */}
          {expanded && (
            <div className="pl-12 space-y-2 pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Answers:
                {loadingAnswers && (
                  <span className="text-xs">(Loading...)</span>
                )}
                {!loadingAnswers && answers.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {answers.length} answer{answers.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {!loadingAnswers && answers.length === 0 && (
                <div className="text-sm text-muted-foreground italic">
                  No answers yet
                </div>
              )}

              {!loadingAnswers && answers.length > 0 && (
                <div className="space-y-2">
                  {answers.map((answer, ansIdx) => (
                    <div
                      key={answer.id}
                      className={`flex items-start gap-2 p-2 rounded-md border ${
                        answer.isCorrect
                          ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {answer.isCorrect ? (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm ${
                            answer.isCorrect
                              ? "font-medium text-green-900 dark:text-green-100"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {answer.content}
                        </div>
                      </div>
                      {answer.isCorrect && (
                        <Badge
                          variant="default"
                          className="bg-green-500 hover:bg-green-600 text-xs"
                        >
                          Correct
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Info (when collapsed) */}
          {!expanded && answers.length > 0 && (
            <div className="pl-12 text-xs text-muted-foreground">
              {answers.filter((a) => a.isCorrect).length} correct answer(s) of{" "}
              {answers.length}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
