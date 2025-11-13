import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { CreateLabRequest, Lab, PaginatedResponse } from "@/types/lab";
import { labService } from "@/services/labService";

export interface LabFilters {
  search: string;
  isActive: string;
  page: number;
  pageSize: number;
}

export const useLabManagement = (initialPageSize: number = 10) => {
  const [filters, setFilters] = useState<LabFilters>({
    search: "",
    isActive: "all",
    page: 1,
    pageSize: initialPageSize,
  });

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [paginationData, setPaginationData] = useState<
    Omit<PaginatedResponse<Lab>, "data">
  >({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLabId, setDeleteLabId] = useState<number | null>(null);

  // Fetch labs
  const fetchLabs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await labService.getLabsPaginated({
        page: filters.page,
        pageSize: filters.pageSize,
        search: filters.search || undefined,
        isActive:
          filters.isActive === "all"
            ? undefined
            : filters.isActive === "active",
      });

      setLabs(response.data);
      setPaginationData({
        currentPage: response.currentPage,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrevious: response.hasPrevious,
      });
    } catch (error) {
      console.error("Failed to fetch labs:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách lab");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch labs when filters change
  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  // Update search
  const updateSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Update status filter
  const updateStatus = useCallback((isActive: string) => {
    setFilters((prev) => ({ ...prev, isActive, page: 1 }));
  }, []);

  // Update page
  const updatePage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // Update page size
  const updatePageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      isActive: "all",
      page: 1,
      pageSize: filters.pageSize,
    });
  }, [filters.pageSize]);

  // Toggle lab status
  const handleToggleStatus = useCallback(
    async (lab: Lab) => {
      try {
        setActionLoading(true);
        await labService.toggleLabStatus(lab.id);
        await fetchLabs();
        toast.success("Cập nhật trạng thái lab thành công");
      } catch (error) {
        console.error("Failed to toggle lab status:", error);
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
      } finally {
        setTimeout(() => {
          setActionLoading(false);
        }, 200);
      }
    },
    [fetchLabs]
  );

  // Open delete dialog
  const handleDeleteClick = useCallback((labId: number) => {
    setDeleteLabId(labId);
  }, []);

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (deleteLabId === null) return;

    try {
      setActionLoading(true);
      const lab = labs.find((l) => l.id === deleteLabId);
      if (!lab) return;

      await labService.deleteLab(deleteLabId);
      await fetchLabs();
      setDeleteLabId(null);
      toast.success(`Xóa lab "${lab.title}" thành công`);
    } catch (error) {
      console.error("Failed to delete lab:", error);
      toast.error("Có lỗi xảy ra khi xóa lab");
    } finally {
      setActionLoading(false);
    }
  }, [deleteLabId, labs, fetchLabs]);

  // Cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteLabId(null);
  }, []);
  const handleCreateLab = useCallback(
    async (data: CreateLabRequest, categoryId: number) => {
      const response = await labService.createLab(data, categoryId);
      console.log("Create Lab Response:", response);
      toast.success(`Tạo lab "${data.title}" thành công`);
      await fetchLabs();
      setFormDialogOpen(false);
    },
    [fetchLabs]
  );
  const handleOpenCreateDialog = useCallback(() => {
    setFormDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setFormDialogOpen(false);
  }, []);
  return {
    // State
    labs,
    paginationData,
    filters,
    isLoading,
    formDialogOpen,
    actionLoading,
    deleteLabId,

    // Fetch
    fetchLabs,

    handleCreateLab,
    // Filters
    updateSearch,
    updateStatus,
    updatePage,
    updatePageSize,
    clearFilters,

    // Actions
    handleToggleStatus,
    handleCloseDialog,
    handleOpenCreateDialog,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
};
