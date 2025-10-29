// edit-question-dialog.tsx
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
import { Loader2, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [selectedCorrectIndex, setSelectedCorrectIndex] = useState<number>(-1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    question?: string;
    answers?: string;
  }>({});

  useEffect(() => {
    if (question && open) {
      setQuestionText(question.question || "");
      setHint(question.hint || "");
      setSolution(question.solution || "");
      if (question.answers && question.answers.length > 0) {
        const sortedAnswers = [...question.answers].sort((a, b) => {
          const idA = a.id ?? 0;
          const idB = b.id ?? 0;
          return idB - idA;
        });

        const answers = sortedAnswers.map((ans) => ({
          id: ans.id,
          content: ans.content,
          isRightAns: ans.isRightAns,
          isNew: false,
        }));
        setAnswersList(answers);

        // Find correct answer index
        const correctIndex = answers.findIndex((ans) => ans.isRightAns);
        setSelectedCorrectIndex(correctIndex);
      } else {
        // Default empty answers if none exist
        setAnswersList([
          { content: "", isRightAns: false, isNew: true },
          { content: "", isRightAns: false, isNew: true },
        ]);
        setSelectedCorrectIndex(-1);
      }

      setErrors({});
    }
  }, [question, open]);

  const handleAnswerChange = (index: number, content: string) => {
    const newAnswers = [...answersList];
    newAnswers[index].content = content;
    setAnswersList(newAnswers);
  };

  const handleSelectCorrectAnswer = (index: number) => {
    setSelectedCorrectIndex(index);
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
    } else if (selectedCorrectIndex === -1) {
      newErrors.answers = "Vui lòng chọn 1 câu trả lời đúng";
    } else if (!answersList[selectedCorrectIndex]?.content.trim()) {
      newErrors.answers = "Câu trả lời đúng không được để trống";
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
        .map((ans, index) => ({
          id: ans.isNew ? undefined : ans.id,
          content: ans.content.trim(),
          isRightAns: index === selectedCorrectIndex,
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
      setSelectedCorrectIndex(-1);
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin câu hỏi và các câu trả lời
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-160px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Question */}
            <div className="space-y-2 p-2">
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
                className={errors.question ? "border-red-500 " : ""}
              />
              {errors.question && (
                <p className="text-sm text-red-500">{errors.question}</p>
              )}
            </div>

            {/* Hint */}
            <div className="space-y-2 p-2">
              <Label htmlFor="hint">Gợi ý</Label>
              <Textarea
                id="hint"
                placeholder="Nhập gợi ý cho câu hỏi..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                rows={2}
                disabled={saving || loading}
                className="p-"
              />
            </div>

            {/* Solution */}
            <div className="space-y-2 p-2">
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
            <div className="space-y-4 p-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>
                    Câu trả lời <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    {selectedCorrectIndex !== -1 && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        Đáp án đúng:{" "}
                        {String.fromCharCode(65 + selectedCorrectIndex)}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {answersList.filter((a) => a.content.trim()).length} câu
                      trả lời
                    </Badge>
                  </div>
                </div>
              </div>

              {errors.answers && (
                <p className="text-sm text-red-500">{errors.answers}</p>
              )}

              <RadioGroup
                value={selectedCorrectIndex.toString()}
                onValueChange={(value) =>
                  handleSelectCorrectAnswer(parseInt(value))
                }
              >
                <div className="space-y-3">
                  {answersList.map((answer, index) => (
                    <Card
                      key={`answer-${answer.id || index}`}
                      className={`transition-all hover:shadow-md ${
                        index === selectedCorrectIndex
                          ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20 shadow-sm"
                          : "border hover:border-gray-300"
                      }`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          {/* Radio Button for Correct Answer */}
                          <div className="flex-shrink-0">
                            <RadioGroupItem
                              value={index.toString()}
                              id={`answer-${index}`}
                              disabled={saving || loading}
                              className={`h-5 w-5 ${
                                index === selectedCorrectIndex
                                  ? "border-green-600"
                                  : ""
                              }`}
                            />
                          </div>

                          {/* Answer Content */}
                          <div className="flex-1 space-y-2.5">
                            {/* Badges Row */}
                            {(answer.isNew ||
                              index === selectedCorrectIndex) && (
                              <div className="flex items-center gap-2">
                                {answer.isNew && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs font-medium"
                                  >
                                    Mới
                                  </Badge>
                                )}
                                {index === selectedCorrectIndex && (
                                  <Badge className="text-xs bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Đáp án đúng
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Input Field */}
                            <Label
                              htmlFor={`answer-input-${index}`}
                              className="cursor-pointer block"
                            >
                              <Input
                                id={`answer-input-${index}`}
                                placeholder={`Câu trả lời ${String.fromCharCode(
                                  65 + index
                                )}...`}
                                value={answer.content}
                                onChange={(e) =>
                                  handleAnswerChange(index, e.target.value)
                                }
                                disabled={saving || loading}
                                className={`h-11 text-base ${
                                  index === selectedCorrectIndex
                                    ? "font-medium border-green-400 bg-white dark:bg-green-950/10 focus-visible:ring-green-500"
                                    : "bg-white dark:bg-gray-950"
                                }`}
                              />
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </RadioGroup>
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
