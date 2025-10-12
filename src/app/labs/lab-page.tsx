import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LabHeader } from "@/components/labs/index/lab-header";
import { LabFilterBar } from "@/components/labs/index/lab-filter-bar";
import { LabCard } from "@/components/labs/index/lab-card";
import { LabEmptyState } from "@/components/labs/index/lab-empty-state";
import { LabFormDialog } from "@/components/labs/index/lab-form-dialog";
import { LabDeleteDialog } from "@/components/labs/index/lab-delete-dialog";
import { Pagination } from "@/components/ui/pagination";

import { Lab, CreateLabRequest, UpdateLabRequest } from "@/types/lab";
import { useLabPage } from "@/hooks/labs/use-lab-page";

export default function LabPage() {
  const { t } = useTranslation('common');

  // Use the custom hook for lab page logic
  const {
    labs,
    loading,
    actionLoading,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    filters,
    createLab,
    updateLab,
    deleteLab,
    toggleLabStatus,
    handleFiltersChange,
    handlePageChange,
    refresh,
  } = useLabPage();

  // Local UI state for dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [deletingLab, setDeletingLab] = useState<Lab | null>(null);

  const [isDialogClosing, setIsDialogClosing] = useState(false);
  const dialogTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current);
    };
  }, []);

  const handlePageSizeChange = useCallback((_size: number) => {
    console.log('Page size change not implemented, keeping default 12');
  }, []);

  // Lab CRUD operations with toast notifications
  const handleCreateLab = async (data: CreateLabRequest) => {
    await createLab(
      data,
      (newLab) => {
        toast.success(t('labs.createSuccess', { name: newLab.name }));
        handleFormDialogClose(() => setFormDialogOpen(false));
      },
      (error) => {
        toast.error(error.message || t('labs.createError'));
      }
    );
  };

  const handleUpdateLab = async (data: UpdateLabRequest) => {
    if (!editingLab) return;

    await updateLab(
      editingLab.id,
      data,
      (updatedLab) => {
        toast.success(t('labs.updateSuccess', { name: updatedLab.name }));
        handleFormDialogClose(() => setFormDialogOpen(false));
      },
      (error) => {
        toast.error(error.message || t('labs.updateError'));
      }
    );
  };

  const handleDeleteLab = async () => {
    if (!deletingLab) return;

    await deleteLab(
      deletingLab.id,
      () => {
        toast.success(t('labs.deleteSuccess', { name: deletingLab.name }));
        handleDeleteDialogClose(() => setDeleteDialogOpen(false));
      },
      (error) => {
        toast.error(error.message || t('labs.deleteError'));
      }
    );
  };

  const handleToggleStatus = async (lab: Lab) => {
    await toggleLabStatus(
      lab,
      (updatedLab) => {
        const status = updatedLab.isActive ? t('labs.activated') : t('labs.deactivated');
        toast.success(t('labs.toggleStatusSuccess', { name: updatedLab.name, status }));
      },
      (error) => {
        toast.error(error.message || t('labs.toggleStatusError'));
      }
    );
  };

  // Enhanced dialog handlers
  const handleFormDialogClose = (callback: () => void) => {
    setIsDialogClosing(true);
    dialogTimeoutRef.current = setTimeout(() => {
      callback();
      setEditingLab(null);
      setIsDialogClosing(false);
    }, 150);
  };

  const handleDeleteDialogClose = (callback: () => void) => {
    setIsDialogClosing(true);
    dialogTimeoutRef.current = setTimeout(() => {
      callback();
      setDeletingLab(null);
      setIsDialogClosing(false);
    }, 150);
  };

  // Dialog control functions
  const openCreateDialog = () => {
    setEditingLab(null);
    setIsDialogClosing(false);
    setFormDialogOpen(true);
  };

  const openEditDialog = (lab: Lab) => {
    setEditingLab(lab);
    setIsDialogClosing(false);
    setFormDialogOpen(true);
  };

  const openDeleteDialog = (lab: Lab) => {
    setDeletingLab(lab);
    setIsDialogClosing(false);
    setDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    refresh();
    toast.success(t('labs.refreshSuccess'));
  };

  const hasFilters = filters.search.trim() !== "" || filters.status !== undefined || filters.sortBy !== "newest";

  const handleFormDialogOpenChange = (open: boolean) => {
    if (actionLoading || isDialogClosing) return;
    
    if (!open) {
      handleFormDialogClose(() => setFormDialogOpen(false));
    } else {
      setFormDialogOpen(open);
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    if (actionLoading || isDialogClosing) return;
    
    if (!open) {
      handleDeleteDialogClose(() => setDeleteDialogOpen(false));
    } else {
      setDeleteDialogOpen(open);
    }
  };

  return (
    <div className="min-h-screen w-full px-4 py-6 space-y-6">
      {/* Header */}
      <LabHeader
        onCreateLab={openCreateDialog}
        onRefresh={handleRefresh}
        loading={loading}
        totalLabs={totalItems}
      />

      {/* Filters */}
      <LabFilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalCount={totalItems}
        loading={loading}
      />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">{t('labs.loadingLabs')}</span>
        </div>
      ) : labs.length === 0 ? (
        <LabEmptyState
          hasFilters={hasFilters}
          onCreateLab={openCreateDialog}
          onClearFilters={() => handleFiltersChange({
            search: "",
            status: undefined, 
            sortBy: "newest"
          })}
          loading={actionLoading}
        />
      ) : (
        <>
          {/* Labs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {labs.map((lab) => (
              <LabCard
                key={lab.id}
                lab={lab}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onToggleStatus={handleToggleStatus}
                loading={actionLoading}
              />
            ))}
          </div>

          {/* Pagination - chỉ hiển thị khi có nhiều hơn 1 trang */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          )}
        </>
      )}

      {/* Enhanced Dialogs với better state management */}
      <LabFormDialog
        open={formDialogOpen && !isDialogClosing}
        onOpenChange={handleFormDialogOpenChange}
        lab={editingLab}
        onSubmit={editingLab ? handleUpdateLab : handleCreateLab}
        loading={actionLoading}
      />

      <LabDeleteDialog
        open={deleteDialogOpen && !isDialogClosing}
        onOpenChange={handleDeleteDialogOpenChange}
        lab={deletingLab}
        onConfirm={handleDeleteLab}
        loading={actionLoading}
      />
    </div>
  );
}