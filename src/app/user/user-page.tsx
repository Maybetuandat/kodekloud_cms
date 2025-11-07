import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { UserTable } from "@/components/users/user-table";
import { UserFormDialog } from "@/components/users/user-form-dialog";
import { UserDeleteDialog } from "@/components/users/user-delete-dialog";

import { User, CreateUserRequest, UpdateUserRequest } from "@/types/user";
import { useUserPage } from "./use-user-page";
import { date } from "zod";

export default function UserPage() {
  const {
    users,
    loading,
    actionLoading,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    filters,
    createUser,
    updateUser,
    deleteUser,
    setFilters,
    setCurrentPage,
    setPageSize,
  } = useUserPage();

  // Local UI state for dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Local state for search input
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.keyword);

  // Handle search submit
  const handleSearchSubmit = () => {
    setFilters({ keyword: localSearchTerm });
  };

  // Handle search clear
  const handleSearchClear = () => {
    setLocalSearchTerm("");
    setFilters({ keyword: "" });
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    if (value === "all") {
      setFilters({ isActive: undefined });
    } else {
      setFilters({ isActive: value === "active" });
    }
  };

  // Get current status filter value
  const statusFilterValue = useMemo(() => {
    if (filters.isActive === undefined) return "all";
    return filters.isActive ? "active" : "inactive";
  }, [filters.isActive]);

  // Handle create user
  const handleCreateUser = () => {
    setEditingUser(null);
    setFormDialogOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (
    data: CreateUserRequest | UpdateUserRequest
  ) => {
    if (editingUser) {
      // Update user
      await updateUser(
        editingUser.id,
        data as UpdateUserRequest,
        (updatedUser) => {
          toast.success("Cập nhật người dùng thành công", {
            description: `${updatedUser.username} đã được cập nhật.`,
          });
          setFormDialogOpen(false);
          setEditingUser(null);
        },
        (error) => {
          toast.error("Cập nhật người dùng thất bại", {
            description: error.message,
          });
        }
      );
    } else {
      // Create user
      await createUser(
        data as CreateUserRequest,
        (newUser) => {
          toast.success("Tạo người dùng thành công", {
            description: `${newUser.username} đã được tạo.`,
          });
          setFormDialogOpen(false);
        },
        (error) => {
          toast.error("Tạo người dùng thất bại", {
            description: error.message,
          });
        }
      );
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    await deleteUser(
      deletingUser.id,
      () => {
        toast.success("Xoá người dùng thành công", {
          description: `${deletingUser.username} đã được xoá.`,
        });
        setDeleteDialogOpen(false);
        setDeletingUser(null);
      },
      (error) => {
        toast.error("Thất bại khi xoá người dùng", {
          description: error.message,
        });
      }
    );
  };

  return (
    <div className="min-h-screen w-full px-6 py-6 space-y-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <Button onClick={handleCreateUser} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Thêm người dùng
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardHeader className="pb-4">
          <FilterBar
            searchTerm={localSearchTerm}
            onSearchChange={setLocalSearchTerm}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
            placeholder="Tìm kiếm bằng username, tên"
            filters={[
              {
                value: statusFilterValue,
                onChange: handleStatusFilterChange,
                placeholder: "Tất cả trạng thái",
                options: [
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "active", label: "Đang hoạt động" },
                  { value: "inactive", label: "Ngừng hoạt động" },
                ],
                widthClass: "w-40",
              },
            ]}
          />
        </CardHeader>
      </Card>

      {/* User Table */}
      <Card>
        <CardContent className="pt-6">
          <UserTable
            key={Date.now()}
            users={users}
            loading={loading}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              loading={loading}
              showInfo={true}
              showPageSizeSelector={true}
              pageSizeOptions={[5, 10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <UserFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        user={editingUser}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      {/* Delete Dialog */}
      <UserDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={deletingUser}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
      />
    </div>
  );
}
