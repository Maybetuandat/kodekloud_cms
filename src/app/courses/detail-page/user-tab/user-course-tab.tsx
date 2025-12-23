import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { RemoveUserDialog } from "@/components/courses/detail/user-tab/remove-user-dialog-from-course";
import { AddUsersToCourseDialog } from "@/components/courses/detail/user-tab/add-users-to-course-dialog";
import { LeaderboardWithActions } from "@/components/courses/detail/user-tab/dashboard-table";
import { DashboardEntry } from "@/types/leaderboard";
import { Pagination } from "@/components/ui/pagination";

interface CourseUserTabProps {
  isLoadingLeaderboard: boolean;
  courseId: number;
  onRemoveUser: (userId: number) => Promise<void>;
  onRefresh: () => void;
  leaderboard: DashboardEntry[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function CourseUserTab({
  isLoadingLeaderboard,
  courseId,
  onRemoveUser,
  onRefresh,
  leaderboard,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: CourseUserTabProps) {
  const { t } = useTranslation(["courses", "common"]);
  const [userIdToRemove, setUserIdToRemove] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleDeleteClick = (userId: number) => {
    setUserIdToRemove(userId);
  };

  const handleConfirmRemove = async () => {
    if (!userIdToRemove) return;

    try {
      setIsRemoving(true);
      await onRemoveUser(userIdToRemove);
      setUserIdToRemove(null);
      onRefresh();
    } catch (error) {
      console.error("Error removing user:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddUsersSuccess = () => {
    onRefresh();
  };

  // Tìm user info từ leaderboard
  const userToRemove = leaderboard.find(
    (entry) => entry.userId === userIdToRemove
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">🏆 Bảng xếp hạng</h3>
          <p className="text-sm text-muted-foreground">
            Theo dõi tiến độ và thành tích của sinh viên
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Thêm sinh viên
        </Button>
      </div>

      {/* Leaderboard Table */}
      <LeaderboardWithActions
        entries={leaderboard}
        loading={isLoadingLeaderboard}
        onDeleteUser={handleDeleteClick}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        loading={isLoadingLeaderboard}
        showInfo={true}
        showPageSizeSelector={true}
        pageSizeOptions={[5, 10, 20, 50, 100]}
      />

      {/* Remove User Dialog */}
      <RemoveUserDialog
        user={
          userToRemove
            ? {
                id: userToRemove.userId,
                username: userToRemove.username,
                firstName: userToRemove.fullName.split(" ").pop() || "",
                lastName: userToRemove.fullName
                  .split(" ")
                  .slice(0, -1)
                  .join(" "),
                email: "",
                phoneNumber: "",
                isActive: true,
                role: { id: 1, name: "ROLE_STUDENT" },
              }
            : null
        }
        isRemoving={isRemoving}
        setIsRemoving={setIsRemoving}
        onClose={() => setUserIdToRemove(null)}
        onRemoveUser={handleConfirmRemove}
        onRefresh={onRefresh}
      />

      {/* Add Users Dialog */}
      <AddUsersToCourseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        courseId={courseId}
        onSuccess={handleAddUsersSuccess}
      />
    </div>
  );
}
