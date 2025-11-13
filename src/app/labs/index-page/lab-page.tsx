import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { Lab } from "@/types/lab";
import { LabList } from "@/components/labs/index-page/lab-list";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { useLabManagement } from "./use-lab-page";
import DeleteLabDialog from "@/components/labs/index-page/delete-lab-dialog";
import { LabFormDialog } from "@/components/labs/detail/index/lab-form-dialog";

export default function LabPage() {
  const navigate = useNavigate();

  const {
    labs,
    paginationData,
    filters,
    isLoading,
    actionLoading,
    deleteLabId,
    formDialogOpen,
    updateSearch,
    updateStatus,
    updatePage,
    updatePageSize,
    handleToggleStatus,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleOpenCreateDialog,
    handleCreateLab,
    handleCloseDialog,
  } = useLabManagement(10);

  const handleView = (lab: Lab) => {
    navigate(`/labs/${lab.id}`);
  };

  const statusFilterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Đang hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
  ];

  const [localSearchTerm, setLocalSearchTerm] = useState(filters.search);
  useEffect(() => {
    setLocalSearchTerm(filters.search);
  }, [filters.search]);
  const handleSearchSubmit = () => {
    updateSearch(localSearchTerm);
  };
  const handleSearchClear = () => {
    setLocalSearchTerm("");
    updateSearch("");
  };

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
        </div>
        <Button onClick={handleOpenCreateDialog} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Tạo Lab mới
        </Button>
      </div>

      {/* Filter and Search */}
      <Card>
        <CardContent className="pt-6">
          <FilterBar
            searchTerm={localSearchTerm}
            onSearchChange={setLocalSearchTerm}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
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
              currentPage={filters.page}
              totalPages={paginationData.totalPages}
              totalElements={paginationData.totalItems}
              pageSize={filters.pageSize}
              onPageChange={(page) => updatePage(page)}
              onPageSizeChange={updatePageSize}
              loading={isLoading}
              showInfo={true}
              showPageSizeSelector={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteLabDialog
        open={deleteLabId !== null}
        lab={labToDelete || null}
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Create Lab Form Dialog */}
      <LabFormDialog
        open={formDialogOpen}
        onOpenChange={handleCloseDialog}
        onSubmit={handleCreateLab}
      />
    </div>
  );
}
