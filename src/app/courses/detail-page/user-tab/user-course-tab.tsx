import { User } from "@/types/user";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { UserTableCourseDetail } from "@/components/courses/detail/user-tab/user-table-in-course-detail";
import { RemoveUserDialog } from "@/components/courses/detail/user-tab/remove-user-dialog-from-course";
import { AddUsersToCourseDialog } from "@/components/courses/detail/user-tab/add-users-to-course-dialog";

interface CourseUserTabProps {
  isLoading: boolean;
  usersInCourse: User[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  courseId: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearchChange: (search: string) => void;
  onRemoveUser: (userId: number) => Promise<void>;
  onRefresh: () => void;
}

export default function CourseUserTab({
  isLoading,
  usersInCourse,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  hasNext,
  hasPrevious,
  courseId,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onRemoveUser,
  onRefresh,
}: CourseUserTabProps) {
  const { t } = useTranslation(["courses", "common"]);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [userToRemove, setUserToRemove] = useState<User | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleSearchClear = () => {
    setLocalSearchTerm("");
    onSearchChange("");
  };

  const handleDelete = (user: User) => {
    setUserToRemove(user);
  };

  const handleSearchSubmit = () => {
    setLocalSearchTerm(localSearchTerm);
    onSearchChange(localSearchTerm);
  };

  const handleAddUsersSuccess = () => {
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Header with Filter and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <FilterBar
            searchTerm={localSearchTerm}
            onSearchChange={setLocalSearchTerm}
            onSearchClear={handleSearchClear}
            onSearchSubmit={handleSearchSubmit}
            placeholder={t("Tìm kiếm theo tên, email hoặc tên đăng nhập...")}
          />
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* User Table */}
      <UserTableCourseDetail
        users={usersInCourse}
        loading={isLoading}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        loading={isLoading}
        showInfo={true}
        showPageSizeSelector={true}
        pageSizeOptions={[5, 10, 20, 50, 100]}
      />

      {/* Remove User Dialog */}
      <RemoveUserDialog
        user={userToRemove}
        isRemoving={isRemoving}
        setIsRemoving={setIsRemoving}
        onClose={() => setUserToRemove(null)}
        onRemoveUser={onRemoveUser}
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
