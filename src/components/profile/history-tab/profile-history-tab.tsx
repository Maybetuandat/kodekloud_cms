// src/components/profile/profile-history-tab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, Calendar, Award } from "lucide-react";
import { format } from "date-fns";

interface UserLabSession {
  id: number;
  lab: {
    id: number;
    title: string;
    labNumber: number;
  };
  status: string;
  score: number;
  totalTests: number;
  passedTests: number;
  startedAt: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface LabHistoryResponse {
  data: UserLabSession[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ProfileHistoryTabProps {
  historyData: LabHistoryResponse | null;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearch: () => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
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

export function ProfileHistoryTab({
  historyData,
  isLoading,
  searchInput,
  setSearchInput,
  handleSearch,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  setCurrentPage,
  setPageSize,
}: ProfileHistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Lịch sử thực hành
        </CardTitle>
        <div className="flex items-center gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên bài lab..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Tìm kiếm
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : historyData && historyData.data.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bài Lab</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Test Cases</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyData.data.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Lab {session.lab.labNumber}
                        </Badge>
                        {session.lab.title}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold">
                          {session.score || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {session.passedTests}/{session.totalTests}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {session.startedAt
                          ? format(
                              new Date(session.startedAt),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {session.submittedAt
                          ? format(
                              new Date(session.submittedAt),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              loading={isLoading}
              showInfo={true}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 20, 50, 100]}
            />
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Không có lịch sử thực hành
          </p>
        )}
      </CardContent>
    </Card>
  );
}
