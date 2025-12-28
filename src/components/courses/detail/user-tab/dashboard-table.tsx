import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Medal, Award, Trash2 } from "lucide-react";
import { DashboardEntry } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardWithActionsProps {
  entries: DashboardEntry[];
  loading: boolean;
  onDeleteUser: (userId: number) => void;
}

export const DashboardWithActions: FC<DashboardWithActionsProps> = ({
  entries,
  loading,
  onDeleteUser,
}) => {
  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5">
              <TableHead className="w-[80px] font-bold">Hạng</TableHead>
              <TableHead className="font-bold">Sinh viên</TableHead>
              <TableHead className="text-center font-bold">Điểm</TableHead>
              <TableHead className="text-center font-bold">
                Hoàn thành
              </TableHead>
              <TableHead className="text-center font-bold">
                Tổng lần thử
              </TableHead>

              <TableHead className="text-center font-bold">Tỷ lệ</TableHead>
              <TableHead className="text-center font-bold">
                Hoạt động cuối
              </TableHead>
              <TableHead className="text-center font-bold w-[100px]">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">
          Chưa có dữ liệu xếp hạng
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Sinh viên cần hoàn thành bài lab để xuất hiện trong bảng xếp hạng
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5">
            <TableHead className="w-[80px] font-bold">Hạng</TableHead>
            <TableHead className="font-bold">Sinh viên</TableHead>
            <TableHead className="text-center font-bold">Điểm</TableHead>
            <TableHead className="text-center font-bold">Hoàn thành</TableHead>
            <TableHead className="text-center font-bold">
              Tổng lần thử
            </TableHead>
            <TableHead className="text-center font-bold">Tỷ lệ</TableHead>
            <TableHead className="text-center font-bold">
              Hoạt động cuối
            </TableHead>
            <TableHead className="text-center font-bold w-[100px]">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.userId}
              className={`hover:bg-muted/50 ${
                entry.rank <= 3 ? "bg-muted/30" : ""
              }`}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">{entry.rank}</div>
              </TableCell>

              <TableCell>
                <div>
                  <div className="font-medium">{entry.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    @{entry.username}
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-center">
                <Badge variant="secondary" className="font-semibold text-lg">
                  {entry.totalScore}
                </Badge>
              </TableCell>

              <TableCell className="text-center">
                <span className="font-medium">{entry.completedLabs}</span>
              </TableCell>

              <TableCell className="text-center">
                <span className="font-medium">{entry.totalAttempts}</span>
              </TableCell>

              <TableCell className="text-center">
                <Badge
                  variant={
                    entry.completionRate >= 80
                      ? "default"
                      : entry.completionRate >= 50
                      ? "secondary"
                      : "outline"
                  }
                >
                  {entry.completionRate.toFixed(1)}%
                </Badge>
              </TableCell>

              <TableCell className="text-center">
                <span className="text-sm text-muted-foreground">
                  {entry.lastActivityAt
                    ? new Date(entry.lastActivityAt).toLocaleString("vi-VN")
                    : "-"}
                </span>
              </TableCell>

              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteUser(entry.userId);
                  }}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
