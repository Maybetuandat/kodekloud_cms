// components/courses/detail/user-tab/leaderboard-with-actions.tsx
import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Trash2 } from "lucide-react";
import { LeaderboardEntry } from "@/types/leaderboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LeaderboardWithActionsProps {
  entries: LeaderboardEntry[];
  loading: boolean;
  onDeleteUser: (userId: number) => void;
}

export const LeaderboardWithActions: FC<LeaderboardWithActionsProps> = ({
  entries,
  loading,
  onDeleteUser,
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-muted-foreground font-semibold">#{rank}</span>
        );
    }
  };

  const formatTime = (minutes: number) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Hạng</TableHead>
              <TableHead>Sinh viên</TableHead>
              <TableHead className="text-center">Điểm</TableHead>
              <TableHead className="text-center">Hoàn thành</TableHead>
              <TableHead className="text-center">Tỷ lệ</TableHead>
              <TableHead className="text-center">TB Time</TableHead>
              <TableHead className="text-center w-[100px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md mx-auto" />
                </TableCell>
              </TableRow>
            ))}
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
            <TableHead className="text-center font-bold">Tỷ lệ</TableHead>
            <TableHead className="text-center font-bold">TB Time</TableHead>
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
                <div className="flex items-center gap-2">
                  {getRankIcon(entry.rank)}
                </div>
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
                <span className="font-medium">
                  {entry.completedLabs}/{entry.totalLabs}
                </span>
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

              <TableCell className="text-center text-muted-foreground">
                {formatTime(entry.averageTime)}
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
