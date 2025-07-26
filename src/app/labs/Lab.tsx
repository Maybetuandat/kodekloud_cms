import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LabHeader } from "@/components/labs/lab-header";
import { LabFilterBar, LabFilters } from "@/components/labs/lab-filter-bar";
import { LabCard } from "@/components/labs/lab-card";
import { LabFormDialog } from "@/components/labs/lab-form-dialog";
import { LabDeleteDialog } from "@/components/labs/lab-delete-dialog";
import { LabEmptyState } from "@/components/labs/lab-empty-state";

import { labService } from "@/services/labService";
import { Lab, CreateLabRequest, UpdateLabRequest } from "@/types/lab";

export default function LabPage() {
  const { t } = useTranslation('common');
  
  // State management
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [deletingLab, setDeletingLab] = useState<Lab | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<LabFilters>({
    search: "",
    status: "all",
    sortBy: "newest",
  });

  // Fetch labs data
  const fetchLabs = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const data = await labService.getLabs();
      setLabs(data);
      
      if (showToast) {
        toast.success(t('labs.refreshSuccess'));
      }
    } catch (error) {
      console.error("Failed to fetch labs:", error);
      toast.error(t('labs.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load data on mount
  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  // Filter and sort labs
  const filteredLabs = useMemo(() => {
    let result = [...labs];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(lab => 
        lab.name.toLowerCase().includes(searchTerm) ||
        lab.description?.toLowerCase().includes(searchTerm) ||
        lab.baseImage.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      result = result.filter(lab => 
        filters.status === "active" ? lab.isActive : !lab.isActive
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "estimatedTime":
          return a.estimatedTime - b.estimatedTime;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [labs, filters]);

  // Create lab handler
  const handleCreateLab = useCallback(async (data: CreateLabRequest) => {
    try {
      setActionLoading(true);
      const newLab = await labService.createLab(data);
      setLabs(prev => [newLab, ...prev]);
      toast.success(t('labs.createSuccess', { name: newLab.name }));
    } catch (error) {
      console.error("Failed to create lab:", error);
      toast.error(t('labs.createError'));
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [t]);

  // Update lab handler
  const handleUpdateLab = useCallback(async (data: UpdateLabRequest) => {
    if (!editingLab) return;

    try {
      setActionLoading(true);
      const updatedLab = await labService.updateLab(editingLab.id, data);
      setLabs(prev => prev.map(l => l.id === editingLab.id ? updatedLab : l));
      toast.success(t('labs.updateSuccess', { name: updatedLab.name }));
    } catch (error) {
      console.error("Failed to update lab:", error);
      toast.error(t('labs.updateError'));
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [editingLab, t]);

  // Delete lab handler
  const handleDeleteLab = useCallback(async () => {
    if (!deletingLab) return;

    try {
      setActionLoading(true);
      await labService.deleteLab(deletingLab.id);
      setLabs(prev => prev.filter(l => l.id !== deletingLab.id));
      toast.success(t('labs.deleteSuccess', { name: deletingLab.name }));
    } catch (error) {
      console.error("Failed to delete lab:", error);
      toast.error(t('labs.deleteError'));
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [deletingLab, t]);

  // Toggle lab status handler
  const handleToggleStatus = useCallback(async (lab: Lab) => {
    try {
      setActionLoading(true);
      const updatedLab = await labService.toggleLabStatus(lab.id);
      setLabs(prev => prev.map(l => l.id === lab.id ? updatedLab : l));
      toast.success(
        t('labs.toggleStatusSuccess', { 
          name: lab.name, 
          status: updatedLab.isActive ? t('labs.activated') : t('labs.deactivated')
        })
      );
    } catch (error) {
      console.error("Failed to toggle lab status:", error);
      toast.error(t('labs.toggleStatusError'));
    } finally {
      setActionLoading(false);
    }
  }, [t]);

  // Dialog handlers
  const openCreateDialog = () => {
    setEditingLab(null);
    setFormDialogOpen(true);
  };

  const openEditDialog = (lab: Lab) => {
    setEditingLab(lab);
    setFormDialogOpen(true);
  };

  const openDeleteDialog = (lab: Lab) => {
    setDeletingLab(lab);
    setDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      sortBy: "newest",
    });
  };

  const hasFilters = !!filters.search || filters.status !== "all" || filters.sortBy !== "newest";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <LabHeader
        onCreateLab={openCreateDialog}
        onRefresh={() => fetchLabs(true)}
        loading={loading}
        totalLabs={labs.length}
      />

      {/* Filter Bar */}
      <LabFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={filteredLabs.length}
        loading={loading}
      />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">{t('labs.loadingLabs')}</span>
        </div>
      ) : filteredLabs.length === 0 ? (
        <LabEmptyState
          hasFilters={hasFilters}
          onCreateLab={openCreateDialog}
          onClearFilters={clearFilters}
          loading={actionLoading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLabs.map((lab) => (
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
      )}

      {/* Dialogs */}
      <LabFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        lab={editingLab}
        onSubmit={editingLab ? handleUpdateLab : handleCreateLab}
        loading={actionLoading}
      />

      <LabDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        lab={deletingLab}
        onConfirm={handleDeleteLab}
        loading={actionLoading}
      />
    </div>
  );
}