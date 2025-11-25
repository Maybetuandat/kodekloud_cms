import { useState, useRef } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { excelService, ExcelQuestionRow } from "@/services/excelService";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LabUploadExcelDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (questions: ExcelQuestionRow[]) => Promise<any>;
}

export function LabUploadExcelDialog({
  open,
  onClose,
  onUpload,
}: LabUploadExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ExcelQuestionRow[] | null>(
    null
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setError("Vui lòng tải lên một tệp Excel hợp lệ (.xlsx hoặc .xls)");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadResult(null);

    try {
      const questions = await excelService.parseExcelFile(selectedFile);
      if (questions.length === 0) {
        setError("Không tìm thấy câu hỏi hợp lệ nào trong tệp");
        return;
      }
      setPreviewData(questions);
    } catch (err) {
      setError("Không thể phân tích tệp Excel. Vui lòng kiểm tra định dạng.");
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!previewData || previewData.length === 0) return;

    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await onUpload(previewData);

      clearInterval(progressInterval);

      setUploadResult(result);

      toast.success("Tải lên câu hỏi thành công!");
      handleClose();
    } catch (err) {
      setError("Tải lên câu hỏi thất bại. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    setUploadProgress(0);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const handleDownloadTemplate = () => {
    excelService.downloadTemplate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tải lên Câu hỏi từ Excel</DialogTitle>
          <DialogDescription>
            Tải lên tệp Excel chứa các câu hỏi và câu trả lời. Vui lòng tải mẫu
            (template) để biết định dạng chính xác.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-2"
              disabled={loading}
            >
              <Download className="h-4 w-4" />
              Tải Mẫu (Template)
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={loading}
                className="cursor-pointer"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>

            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {error && !uploadResult && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadResult && (
            <Alert
              variant={uploadResult.failed === 0 ? "default" : "destructive"}
              className={
                uploadResult.failed === 0
                  ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                  : "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
              }
            >
              {uploadResult.failed === 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    Tải lên hoàn tất: {uploadResult.success} thành công,{" "}
                    {uploadResult.failed} thất bại
                  </div>
                  {uploadResult.errors.length > 0 && (
                    <div className="text-sm">
                      <div className="font-medium mb-2">Câu hỏi bị lỗi:</div>
                      <ScrollArea className="max-h-[150px]">
                        <ul className="space-y-2">
                          {uploadResult.errors.map(
                            (
                              err: { question: string; error: string },
                              idx: number
                            ) => (
                              <li
                                key={idx}
                                className="text-xs bg-white dark:bg-gray-900 p-2 rounded border"
                              >
                                <div className="font-medium text-red-600">
                                  {err.question}
                                </div>
                                <div className="text-muted-foreground mt-1">
                                  Lỗi: {err.error}
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {previewData && previewData.length > 0 && !error && !uploadResult && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Phân tích tệp thành công! {previewData.length} câu hỏi sẵn sàng
                để tải lên.
              </AlertDescription>
            </Alert>
          )}

          {previewData && previewData.length > 0 && !uploadResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  Xem trước ({previewData.length} câu hỏi)
                </div>
                <Badge variant="secondary">
                  {previewData.reduce((sum, q) => sum + q.answers.length, 0)}{" "}
                  tổng số câu trả lời
                </Badge>
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border">
                <div className="p-4 space-y-4">
                  {previewData.map((q, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-5 space-y-4 bg-card hover:bg-accent/5 transition-colors"
                    >
                      {/* Question Header */}
                      <div className="flex items-start gap-3">
                        <Badge
                          variant="outline"
                          className="shrink-0 mt-1 font-semibold"
                        >
                          Q{index + 1}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-semibold text-lg text-foreground leading-relaxed">
                            {q.question}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Type Question */}
                        {q.typeQuestion && (
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                              Loại câu hỏi
                            </div>
                            <div className="text-sm font-medium">
                              {q.typeQuestion}
                            </div>
                          </div>
                        )}

                        {/* Check Command */}
                        {q.checkCommand && (
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                              Lệnh kiểm tra
                            </div>
                            <div className="text-sm font-mono font-medium break-all">
                              {q.checkCommand}
                            </div>
                          </div>
                        )}

                        {/* Hint */}
                        {q.hint && (
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                              Gợi ý
                            </div>
                            <div className="text-sm">{q.hint}</div>
                          </div>
                        )}

                        {/* Solution */}
                        {q.solution && (
                          <div className="rounded-lg border bg-muted/20 p-4">
                            <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                              Giải pháp
                            </div>
                            <div className="text-sm">{q.solution}</div>
                          </div>
                        )}
                      </div>

                      {/* Answers Section */}
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Câu trả lời ({q.answers.length})
                        </div>
                        <div className="space-y-2">
                          {q.answers.map((answer, ansIdx) => (
                            <div
                              key={ansIdx}
                              className={`flex items-center justify-between gap-3 p-3 rounded-md border transition-colors ${
                                answer.isRightAns
                                  ? "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-800"
                                  : "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700"
                              }`}
                            >
                              <div className="flex-1">
                                <div
                                  className={`text-sm ${
                                    answer.isRightAns
                                      ? "font-semibold text-green-900 dark:text-green-100"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {answer.content}
                                </div>
                              </div>
                              {answer.isRightAns && (
                                <Badge
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold"
                                >
                                  ✓ Đáp án đúng
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Đang tải lên câu hỏi...
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {uploadResult && uploadResult.failed > 0 ? "Đóng" : "Hủy"}
          </Button>
          {(!uploadResult || uploadResult.failed > 0) && (
            <Button
              onClick={handleUpload}
              disabled={!previewData || previewData.length === 0 || loading}
            >
              {loading
                ? "Đang tải lên..."
                : `Tải lên ${previewData?.length || 0} Câu hỏi`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
