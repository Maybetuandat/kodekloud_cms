import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Award, Eye } from "lucide-react";
import { format } from "date-fns";
import { UserLabSession } from "@/types/labSesion";

interface HistoryTableProps {
  data: UserLabSession[];
  isLoading: boolean;
  onViewDetail: (session: UserLabSession) => void;
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

export function HistoryTable({
  data,
  isLoading,
  onViewDetail,
}: HistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        Không có lịch sử thực hành
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bài Lab</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Điểm</TableHead>
          <TableHead>Test Cases</TableHead>
          <TableHead>Ngày bắt đầu</TableHead>
          <TableHead>Ngày nộp</TableHead>
          <TableHead className="text-center">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((session) => (
          <TableRow key={session.sessionId}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Lab {session.labTitle}</Badge>
                {session.labTitle}
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(session.status)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-500" />
              </div>
            </TableCell>
            <TableCell></TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {session.startedAt
                  ? format(new Date(session.startedAt), "dd/MM/yyyy HH:mm")
                  : "-"}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {session.completedAt
                  ? format(new Date(session.completedAt), "dd/MM/yyyy HH:mm")
                  : "-"}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetail(session)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Chi tiết
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
