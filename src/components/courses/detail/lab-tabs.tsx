import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LabList } from "@/components/courses/detail/lab-list";
import { Lab } from "@/types/lab";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { DeleteLabConfirmDialog } from "@/components/courses/detail/delete-lab-confirm-dialog";

interface CourseLabsTabProps {
  labs: Lab[];
  onCreateLab: () => void;
  onDeleteLab: (labId: number) => Promise<void>;
  isLoading?: boolean;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Filter props
  onFiltersChange: (filters: { search: string; status?: boolean }) => void;
}

export function CourseLabsTab({
  labs,
  onCreateLab,
  onDeleteLab,
  isLoading = false,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onFiltersChange,
}: CourseLabsTabProps) {
  const { t } = useTranslation(["courses", "common"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [labToDelete, setLabToDelete] = useState<Lab | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchSubmit = () => {
    const status =
      statusFilter === "all"
        ? undefined
        : statusFilter === "true"
        ? true
        : false;

    onFiltersChange({
      search: searchTerm,
      status,
    });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    const status =
      value === "all" ? undefined : value === "true" ? true : false;

    onFiltersChange({
      search: searchTerm,
      status,
    });
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    onFiltersChange({
      search: "",
      status:
        statusFilter === "all"
          ? undefined
          : statusFilter === "true"
          ? true
          : false,
    });
  };

  const handleDeleteClick = (labId: number) => {
    const lab = labs.find((l) => l.id === labId);
    if (lab) {
      setLabToDelete(lab);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!labToDelete) return;

    setIsDeleting(true);
    try {
      await onDeleteLab(labToDelete.id);
    } catch (error) {
      console.error("Failed to delete lab:", error);

      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t("courses.detail.labs.title")}</h2>
        <Button onClick={onCreateLab} className="gap-2" disabled={isLoading}>
          <Plus className="w-4 h-4" />
          {t("courses.detail.labs.createButton")}
        </Button>
      </div>

      {isLoading && labs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </Card>
      ) : (
        <LabList
          labs={labs}
          onDeleteLab={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          loading={isLoading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteLabConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setLabToDelete(null);
            setIsDeleting(false);
          }
        }}
        lab={labToDelete}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
