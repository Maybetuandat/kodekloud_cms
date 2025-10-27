import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Lab } from "@/types/lab";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LabList } from "@/components/labs/index-page/lab-list";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { useLabManagement } from "./use-lab-page";

export default function LabPage() {
  const navigate = useNavigate();

  const {
    labs,
    paginationData,
    filters,
    isLoading,
    actionLoading,
    deleteLabId,
    updateSearch,
    updateStatus,
    updatePage,
    updatePageSize,
    handleToggleStatus,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  } = useLabManagement(10);

  const handleView = (lab: Lab) => {
    navigate(`/labs/${lab.id}`);
  };

  const handleCreateNew = () => {
    // TODO: Open create lab modal or navigate to create page
    toast.info("Chức năng tạo lab đang được phát triển");
  };

  const statusFilterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
  ];

  // Get lab being deleted for dialog
  const labToDelete = deleteLabId
    ? labs.find((lab) => lab.id === deleteLabId)
    : null;

  return (
    <div className="min-h-screen w-full px-6 py-6 space-y-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Lab</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và tổ chức các bài lab thực hành
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Tạo Lab mới
        </Button>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm và Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <FilterBar
            searchTerm={filters.search}
            onSearchChange={updateSearch}
            placeholder="Tìm kiếm lab theo tên..."
            filters={[
              {
                value: filters.isActive,
                onChange: updateStatus,
                placeholder: "Trạng thái",
                options: statusFilterOptions,
                widthClass: "w-44",
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Lab List */}
      <Card>
        <CardContent className="pt-6">
          <LabList
            labs={labs}
            loading={isLoading}
            onDelete={(lab: Lab) => handleDeleteClick(lab.id)}
            onToggleStatus={handleToggleStatus}
            onView={handleView}
          />

          {/* Pagination */}
          {paginationData.totalPages > 0 && (
            <Pagination
              currentPage={filters.page + 1}
              totalPages={paginationData.totalPages}
              totalElements={paginationData.totalItems}
              pageSize={filters.pageSize}
              onPageChange={(page) => updatePage(page - 1)}
              onPageSizeChange={updatePageSize}
              loading={isLoading}
              showInfo={true}
              showPageSizeSelector={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteLabId !== null}
        onOpenChange={handleCancelDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lab</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lab{" "}
              <span className="font-semibold">"{labToDelete?.title}"</span>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={actionLoading}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
