import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { LabSessionStatistic } from "@/types/labSesion";

interface HistoryDetailDialogProps {
  open: boolean;
  onClose: () => void;
  statisticData: LabSessionStatistic | null;
  isLoading: boolean;
}

const getStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    COMPLETED: { variant: "default", label: "Hoàn thành" },
    IN_PROGRESS: { variant: "secondary", label: "Đang làm" },
    SUBMITTED: { variant: "outline", label: "Đã nộp" },
  };

  const config = statusMap[status] || {
    variant: "outline" as const,
    label: status,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export function HistoryDetailDialog({
  open,
  onClose,
  statisticData,
  isLoading,
}: HistoryDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Chi tiết bài thực hành
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : statisticData ? (
          <div className="space-y-6">
            {/* Thông tin tổng quan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Bài Lab</div>
                  <div className="text-lg font-semibold">
                    {statisticData.labTitle}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    Trạng thái
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(statisticData.status)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    Tổng câu hỏi
                  </div>
                  <div className="text-lg font-semibold">
                    {statisticData.totalQuestions}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">
                    Số câu đúng
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {statisticData.correctAnswers}/
                    {statisticData.totalQuestions}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Danh sách submissions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Chi tiết các câu trả lời
              </h3>
              {statisticData.submissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Câu hỏi</TableHead>
                      <TableHead>Câu trả lời</TableHead>
                      <TableHead className="w-24 text-center">
                        Kết quả
                      </TableHead>
                      <TableHead className="w-40">Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statisticData.submissions.map((submission, index) => (
                      <TableRow key={submission.questionId}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            {submission.questionContent}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {submission.userAnswerContent}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {submission.correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {submission.submittedAt
                              ? format(
                                  new Date(submission.submittedAt),
                                  "dd/MM/yyyy HH:mm:ss"
                                )
                              : "-"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Không có dữ liệu submissions
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Không thể tải dữ liệu chi tiết
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
