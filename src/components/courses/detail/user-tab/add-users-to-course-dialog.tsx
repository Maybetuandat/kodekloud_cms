import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { User } from "@/types/user";
import { userService } from "@/services/userService";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface AddUsersToCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  onSuccess: () => void;
}

export function AddUsersToCourseDialog({
  open,
  onOpenChange,
  courseId,
  onSuccess,
}: AddUsersToCourseDialogProps) {
  const { t } = useTranslation(["courses", "common"]);

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Load available users
  const loadAvailableUsers = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUsersNotInCourse(
        {
          page: currentPage,
          pageSize: pageSize,
          search: searchTerm,
          isActive: true, // Only show active users
        },
        courseId
      );

      setAvailableUsers(response.data);
      setTotalItems(response.totalItems);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error loading available users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAvailableUsers();
    }
  }, [open, currentPage, pageSize, searchTerm, courseId]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedUserIds(new Set());
      setSearchTerm("");
      setLocalSearchTerm("");
      setCurrentPage(1);
    }
  }, [open]);

  const handleSearchSubmit = () => {
    setSearchTerm(localSearchTerm);
    setCurrentPage(1);
  };

  const handleSearchClear = () => {
    setLocalSearchTerm("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(availableUsers.map((user) => user.id));
      setSelectedUserIds(allIds);
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    const newSelected = new Set(selectedUserIds);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleAddUsers = async () => {
    if (selectedUserIds.size === 0) {
      toast.warning("Vui lòng chọn ít nhất một người dùng");
      return;
    }

    try {
      setIsAdding(true);
      await userService.addUsersToCourse(courseId, Array.from(selectedUserIds));

      toast.success(
        `Đã thêm ${selectedUserIds.size} người dùng vào khóa học thành công`
      );

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding users to course:", error);
      toast.error("Không thể thêm người dùng vào khóa học");
    } finally {
      setIsAdding(false);
    }
  };

  const allSelected =
    availableUsers.length > 0 &&
    availableUsers.every((user) => selectedUserIds.has(user.id));

  const someSelected =
    availableUsers.some((user) => selectedUserIds.has(user.id)) && !allSelected;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Thêm người dùng vào khóa học</DialogTitle>
          <DialogDescription>
            Chọn người dùng bạn muốn thêm vào khóa học. Có thể chọn nhiều người
            dùng cùng lúc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Bar */}
          <FilterBar
            searchTerm={localSearchTerm}
            onSearchChange={setLocalSearchTerm}
            onSearchClear={handleSearchClear}
            onSearchSubmit={handleSearchSubmit}
            placeholder="Tìm kiếm theo tên, email hoặc tên đăng nhập..."
          />

          {/* Selected count */}
          {selectedUserIds.size > 0 && (
            <div className="text-sm text-muted-foreground">
              Đã chọn {selectedUserIds.size} người dùng
            </div>
          )}

          {/* User Table */}
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Chọn tất cả"
                      className={
                        someSelected ? "data-[state=checked]:bg-muted" : ""
                      }
                    />
                  </TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : availableUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy người dùng
                    </TableCell>
                  </TableRow>
                ) : (
                  availableUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUserIds.has(user.id)}
                          onCheckedChange={(checked) =>
                            handleSelectUser(user.id, checked as boolean)
                          }
                          aria-label={`Chọn ${
                            user.firstName + " " + user.lastName
                          }`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>
                        {user.firstName + " " + user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            loading={isLoading}
            showInfo={true}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddUsers}
            disabled={selectedUserIds.size === 0 || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang thêm...
              </>
            ) : (
              `Thêm ${
                selectedUserIds.size > 0 ? `(${selectedUserIds.size})` : ""
              }`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
