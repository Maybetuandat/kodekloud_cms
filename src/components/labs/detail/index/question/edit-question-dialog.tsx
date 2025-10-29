// app/labs/detail-page/question/edit-question-dialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Question } from "@/types/question";
import { Loader2, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditQuestionDialogProps {
  open: boolean;
  question: Question | null;
  loading: boolean;
  onClose: () => void;
  onSave: (data: {
    question: string;
    hint: string;
    solution: string;
    answers: Array<{
      id?: number;
      content: string;
      isRightAns: boolean;
    }>;
  }) => Promise<void>;
}

interface AnswerForm {
  id?: number;
  content: string;
  isRightAns: boolean;
  isNew?: boolean;
}

export function EditQuestionDialog({
  open,
  question,
  loading,
  onClose,
  onSave,
}: EditQuestionDialogProps) {
  const [questionText, setQuestionText] = useState("");
  const [hint, setHint] = useState("");
  const [solution, setSolution] = useState("");
  const [answersList, setAnswersList] = useState<AnswerForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    question?: string;
    answers?: string;
  }>({});

  // Initialize form data when dialog opens
  useEffect(() => {
    if (question && open) {
      setQuestionText(question.question || "");
      setHint(question.hint || "");
      setSolution(question.solution || "");

      // Initialize answers list from question.answers
      if (question.answers && question.answers.length > 0) {
        setAnswersList(
          question.answers.map((ans) => ({
            id: ans.id,
            content: ans.content,
            isRightAns: ans.isRightAns,
            isNew: false,
          }))
        );
      } else {
        // Default empty answers if none exist
        setAnswersList([
          { content: "", isRightAns: false, isNew: true },
          { content: "", isRightAns: false, isNew: true },
        ]);
      }

      setErrors({});
    }
  }, [question, open]);

  const handleAddAnswer = () => {
    setAnswersList([
      ...answersList,
      { content: "", isRightAns: false, isNew: true },
    ]);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answersList.length <= 2) {
      return; // Minimum 2 answers required
    }
    setAnswersList(answersList.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (index: number, content: string) => {
    const newAnswers = [...answersList];
    newAnswers[index].content = content;
    setAnswersList(newAnswers);
  };

  const handleToggleCorrectAnswer = (index: number) => {
    const newAnswers = [...answersList];
    newAnswers[index].isRightAns = !newAnswers[index].isRightAns;
    setAnswersList(newAnswers);
  };

  const validateForm = (): boolean => {
    const newErrors: { question?: string; answers?: string } = {};

    // Validate question
    if (!questionText.trim()) {
      newErrors.question = "Vui lòng nhập câu hỏi";
    }

    // Validate answers
    const validAnswers = answersList.filter((ans) => ans.content.trim());
    if (validAnswers.length < 2) {
      newErrors.answers = "Vui lòng nhập ít nhất 2 câu trả lời";
    } else {
      const hasCorrectAnswer = validAnswers.some((ans) => ans.isRightAns);
      if (!hasCorrectAnswer) {
        newErrors.answers = "Vui lòng chọn ít nhất 1 câu trả lời đúng";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const validAnswers = answersList
        .filter((ans) => ans.content.trim())
        .map((ans) => ({
          id: ans.isNew ? undefined : ans.id,
          content: ans.content.trim(),
          isRightAns: ans.isRightAns,
        }));

      await onSave({
        question: questionText.trim(),
        hint: hint.trim(),
        solution: solution.trim(),
        answers: validAnswers,
      });

      handleClose();
    } catch (error) {
      console.error("Failed to save question:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setQuestionText("");
      setHint("");
      setSolution("");
      setAnswersList([]);
      setErrors({});
      onClose();
    }
  };

  const correctAnswersCount = answersList.filter((a) => a.isRightAns).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin câu hỏi và các câu trả lời
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Question */}
            <div className="space-y-2">
              <Label htmlFor="question">
                Câu hỏi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="question"
                placeholder="Nhập câu hỏi..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                disabled={saving || loading}
                className={errors.question ? "border-red-500" : ""}
              />
              {errors.question && (
                <p className="text-sm text-red-500">{errors.question}</p>
              )}
            </div>

            {/* Hint */}
            <div className="space-y-2">
              <Label htmlFor="hint">Gợi ý</Label>
              <Textarea
                id="hint"
                placeholder="Nhập gợi ý cho câu hỏi..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                rows={2}
                disabled={saving || loading}
              />
            </div>

            {/* Solution */}
            <div className="space-y-2">
              <Label htmlFor="solution">Giải pháp</Label>
              <Textarea
                id="solution"
                placeholder="Nhập giải pháp chi tiết..."
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                rows={3}
                disabled={saving || loading}
              />
            </div>

            {/* Answers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>
                    Câu trả lời <span className="text-red-500">*</span>
                  </Label>
                  {correctAnswersCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {correctAnswersCount} câu trả lời đúng
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {answersList.filter((a) => a.content.trim()).length}{" "}
                        tổng câu trả lời
                      </Badge>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAnswer}
                  disabled={saving || loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm câu trả lời
                </Button>
              </div>

              {errors.answers && (
                <p className="text-sm text-red-500">{errors.answers}</p>
              )}

              <div className="space-y-3">
                {answersList.map((answer, index) => (
                  <Card
                    key={`answer-${answer.id || index}`}
                    className={
                      answer.isRightAns
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : ""
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Correct Answer Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleCorrectAnswer(index)}
                          disabled={saving || loading}
                          className="shrink-0 mt-2 focus:outline-none"
                        >
                          {answer.isRightAns ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600 hover:text-green-700 transition-colors" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-400 hover:text-gray-500 transition-colors" />
                          )}
                        </button>

                        {/* Answer Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {String.fromCharCode(65 + index)}
                            </Badge>
                            {answer.isNew && (
                              <Badge variant="secondary" className="text-xs">
                                Mới
                              </Badge>
                            )}
                            {answer.isRightAns && (
                              <Badge className="text-xs bg-green-600">
                                Đáp án đúng
                              </Badge>
                            )}
                          </div>
                          <Input
                            placeholder={`Câu trả lời ${String.fromCharCode(
                              65 + index
                            )}...`}
                            value={answer.content}
                            onChange={(e) =>
                              handleAnswerChange(index, e.target.value)
                            }
                            disabled={saving || loading}
                            className={answer.isRightAns ? "font-medium" : ""}
                          />
                        </div>

                        {/* Delete Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAnswer(index)}
                          disabled={
                            saving || loading || answersList.length <= 2
                          }
                          className="shrink-0"
                          title={
                            answersList.length <= 2
                              ? "Cần ít nhất 2 câu trả lời"
                              : "Xóa câu trả lời"
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                <div className="shrink-0 mt-0.5">💡</div>
                <div className="space-y-1">
                  <p>• Nhấp vào biểu tượng tròn để đánh dấu câu trả lời đúng</p>
                  <p>• Có thể chọn nhiều câu trả lời đúng</p>
                  <p>• Cần ít nhất 2 câu trả lời và 1 câu trả lời đúng</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
