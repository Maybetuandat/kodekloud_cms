import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LabHeader } from "@/components/labs/lab-header";
import { LabFilterBar, LabFilters } from "@/components/labs/lab-filter-bar";
import { LabCard } from "@/components/labs/lab-card";
import { LabEmptyState } from "@/components/labs/lab-empty-state";
import { LabFormDialog } from "@/components/labs/lab-form-dialog";
import { LabDeleteDialog } from "@/components/labs/lab-delete-dialog";
import { Pagination } from "@/components/ui/pagination";

import { Lab, CreateLabRequest, UpdateLabRequest, PaginatedResponse } from "@/types/lab";
import { labService } from "@/services/labService";

export default function LabPage() {
  const { t } = useTranslation('common');

  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState<LabFilters>({
    search: "",
    status: undefined,
    sortBy: "newest",
  });

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

  // Map sort options to API fields
  const mapSortByToApi = (sortBy: string): string => {
    switch (sortBy) {
      case 'newest':
      case 'oldest':
        return 'createdAt';
      case 'name':
        return 'name';
      default:
        return 'createdAt';
    }
  };

  
  const loadLabs = useCallback(async (page = currentPage, customFilters = filters) => {
    try {
      setLoading(true);
      
      console.log("Loading labs with filters:", customFilters, "Page:", page);
      
      const sortBy = mapSortByToApi(customFilters.sortBy);
      const sortDir = customFilters.sortBy === 'oldest' ? 'asc' : 'desc';
      const isActivate = customFilters.status === undefined ? undefined : customFilters.status;
      const search = customFilters.search.trim() || undefined;

      
      const response: PaginatedResponse<Lab> = await labService.getLabsPaginated({
        page,
        size: pageSize,
        sortBy,
        sortDir,
        isActivate,
        search, 
      });

      
      setLabs(response.data);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);

    } catch (error) {
      console.error('Error loading labs:', error);
      toast.error(t('labs.loadError'));
      setLabs([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize, t]);

  // Initial load
  useEffect(() => {
    loadLabs();
  }, []);

  const handleFiltersChange = useCallback((newFilters: LabFilters) => {
    setFilters(newFilters);
    console.log("Filters changed:", newFilters);
    setCurrentPage(0); 
    loadLabs(0, newFilters);
  }, [loadLabs]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    loadLabs(page, filters);
  }, [loadLabs, filters]);

  const handlePageSizeChange = useCallback((size: number) => {
    console.log('Page size change not implemented, keeping default 10');
  }, []);

  // Lab CRUD operations
  const handleCreateLab = async (data: CreateLabRequest) => {
    try {
      setActionLoading(true);
      const newLab = await labService.createLab(data);
      
      toast.success(t('labs.createSuccess', { name: newLab.name }));
      handleFormDialogClose(() => setFormDialogOpen(false));
      
      // Reload current page
      await loadLabs(currentPage, filters);
    } catch (error: any) {
      console.error('Error creating lab:', error);
      toast.error(error.message || t('labs.createError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLab = async (data: UpdateLabRequest) => {
    if (!editingLab) return;

    try {
      setActionLoading(true);
      const updatedLab = await labService.updateLab(editingLab.id, data);
      
      toast.success(t('labs.updateSuccess', { name: updatedLab.name }));
      handleFormDialogClose(() => setFormDialogOpen(false));
      
      // Update labs list
      setLabs(prevLabs => 
        prevLabs.map(lab => lab.id === updatedLab.id ? updatedLab : lab)
      );
    } catch (error: any) {
      console.error('Error updating lab:', error);
      toast.error(error.message || t('labs.updateError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLab = async () => {
    if (!deletingLab) return;

    try {
      setActionLoading(true);
      await labService.deleteLab(deletingLab.id);
      
      toast.success(t('labs.deleteSuccess', { name: deletingLab.name }));
      handleDeleteDialogClose(() => setDeleteDialogOpen(false));
      
      
      const newTotalItems = totalItems - 1;
      const newTotalPages = Math.ceil(newTotalItems / pageSize);
      const shouldGoToPreviousPage = currentPage >= newTotalPages && currentPage > 0;
      
      if (shouldGoToPreviousPage) {
        handlePageChange(currentPage - 1);
      } else {
        await loadLabs(currentPage, filters);
      }
    } catch (error: any) {
      console.error('Error deleting lab:', error);
      toast.error(error.message || t('labs.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (lab: Lab) => {
    try {
      setActionLoading(true);
      const updatedLab = await labService.toggleLabStatus(lab.id);
      
      const status = updatedLab.isActive ? t('labs.activated') : t('labs.deactivated');
      toast.success(t('labs.toggleStatusSuccess', { name: updatedLab.name, status }));
      
      // Update labs list
      setLabs(prevLabs => 
        prevLabs.map(l => l.id === updatedLab.id ? updatedLab : l)
      );
    } catch (error: any) {
      console.error('Error toggling lab status:', error);
      toast.error(error.message || t('labs.toggleStatusError'));
    } finally {
      setActionLoading(false);
    }
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
    loadLabs(currentPage, filters);
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
    <div className="container mx-auto px-4 py-6 space-y-6">
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