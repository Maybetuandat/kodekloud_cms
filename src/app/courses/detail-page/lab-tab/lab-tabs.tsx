import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LabList } from "@/components/courses/detail/lab-tab/lab-list";
import { Lab } from "@/types/lab";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { DeleteLabConfirmDialog } from "@/components/courses/detail/lab-tab/delete-lab-confirm-dialog";
import { SelectLabsDialog } from "@/components/courses/detail/lab-tab/select-labs-dialog";

interface CourseLabsTabProps {
  labs: Lab[];
  courseId: number;
  addLabsToCourse: (labIds: number[]) => Promise<void>;
  fetchAvailableLabs: () => void;
  removeLabFromCourse: (labId: number) => Promise<void>;
  isLoading?: boolean;
  isLoadingAvailableLabs?: boolean;
  availableLabs: Lab[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  onFiltersChange: (filters: { search: string; status?: boolean }) => void;
}

export function CourseLabsTab({
  labs,
  fetchAvailableLabs,
  removeLabFromCourse,
  courseId,
  isLoadingAvailableLabs,
  availableLabs,
  addLabsToCourse,
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

  // Remove confirmation dialog state
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isSelectLabsOpen, setIsSelectLabsOpen] = useState(false);
  const [labToRemove, setLabToRemove] = useState<Lab | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

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

  const handleOpenSelectLabs = () => {
    fetchAvailableLabs();
    setIsSelectLabsOpen(true);
  };
  const handleRemoveClick = (labId: number) => {
    const lab = labs.find((l) => l.id === labId);
    if (lab) {
      setLabToRemove(lab);
      setIsRemoveDialogOpen(true);
    }
  };

  const handleConfirmRemove = async () => {
    if (!labToRemove) return;

    setIsRemoving(true);
    try {
      await removeLabFromCourse(labToRemove.id);
      setIsRemoveDialogOpen(false);
      setLabToRemove(null);
    } catch (error) {
      console.error("Failed to remove lab:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t("courses.detail.labs.title")}</h2>
        <Button
          onClick={handleOpenSelectLabs}
          className="gap-2"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Thêm bài thực hành
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
          onDeleteLab={handleRemoveClick}
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

      {/* Select Labs Dialog */}
      <SelectLabsDialog
        open={isSelectLabsOpen}
        onOpenChange={setIsSelectLabsOpen}
        addLabsToCourse={addLabsToCourse}
        availableLabs={availableLabs}
        loading={isLoadingAvailableLabs}
      />
      {/* Remove Confirmation Dialog */}
      <DeleteLabConfirmDialog
        open={isRemoveDialogOpen}
        onOpenChange={(open) => {
          setIsRemoveDialogOpen(open);
          if (!open) {
            setLabToRemove(null);
            setIsRemoving(false);
          }
        }}
        lab={labToRemove}
        onConfirm={handleConfirmRemove}
        loading={isRemoving}
      />
    </div>
  );
}
