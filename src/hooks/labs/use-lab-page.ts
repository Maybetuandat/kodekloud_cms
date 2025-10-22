import { useState, useCallback, useEffect } from "react";
import { labService } from "@/services/labService";
import {
  Lab,
  PaginatedResponse,
  CreateLabRequest,
  UpdateLabRequest,
} from "@/types/lab";

export interface LabFilters {
  search: string;
  status: undefined | true | false;
  sortBy: "newest" | "oldest";
}

interface UseLabPageOptions {
  courseId?: number;
  autoLoad?: boolean;
}

interface UseLabPageState {
  // Lab data
  labs: Lab[];

  // Loading states
  loading: boolean;
  actionLoading: boolean;

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;

  // Filter state
  filters: LabFilters;

  // Error handling
  error: string | null;
}

interface UseLabPageActions {
  // Data fetching
  loadLabs: (
    page?: number,
    customFilters?: Partial<LabFilters>
  ) => Promise<void>;

  // CRUD operations
  createLab: (
    data: CreateLabRequest,
    onSuccess?: (lab: Lab) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  updateLab: (
    id: string,
    data: UpdateLabRequest,
    onSuccess?: (lab: Lab) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  deleteLab: (
    id: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  toggleLabStatus: (
    lab: Lab,
    onSuccess?: (lab: Lab) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;

  // Filter & Pagination handlers
  handleFiltersChange: (newFilters: Partial<LabFilters>) => void;
  handlePageChange: (page: number) => void;

  // Utility functions
  clearError: () => void;
  resetFilters: () => void;
  refresh: () => void;
}

const initialFilters: LabFilters = {
  search: "",
  status: undefined,
  sortBy: "newest",
};

const initialState: UseLabPageState = {
  labs: [],
  loading: false,
  actionLoading: false,
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalItems: 0,
  hasNext: false,
  hasPrevious: false,
  filters: initialFilters,
  error: null,
};

/**
 * Custom hook for managing lab page operations
 * Handles fetching lab list, pagination, filtering, and CRUD operations
 *
 * @param options - Configuration options including courseId
 * @returns Object containing lab page state and action functions
 */
export const useLabPage = (
  options: UseLabPageOptions = {}
): UseLabPageState & UseLabPageActions => {
  const { courseId, autoLoad = true } = options;
  const [state, setState] = useState<UseLabPageState>(initialState);

  /**
   * Load labs with pagination and filters
   */
  const loadLabs = useCallback(
    async (page = 0, customFilters?: Partial<LabFilters>): Promise<void> => {
      // If no courseId is provided, skip loading
      if (!courseId) {
        console.warn("useLabPage: courseId is required to load labs");
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const filters = customFilters
          ? { ...state.filters, ...customFilters }
          : state.filters;
        const isActive =
          filters.status === undefined ? undefined : filters.status;
        const search = filters.search.trim() || undefined;

        const response: PaginatedResponse<Lab> =
          await labService.getLabsByCourseId(courseId, {
            page,
            size: state.pageSize,
            isActive,
            search,
          });

        setState((prev) => ({
          ...prev,
          labs: response.data,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
          hasNext: response.hasNext,
          hasPrevious: response.hasPrevious,
          loading: false,
          filters,
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load labs";
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          labs: [],
          totalPages: 0,
          totalItems: 0,
          hasNext: false,
          hasPrevious: false,
          loading: false,
        }));
      }
    },
    [courseId, state.filters, state.pageSize]
  );

  /**
   * Initial load on mount if autoLoad is enabled and courseId is provided
   */
  useEffect(() => {
    if (autoLoad && courseId) {
      loadLabs();
    }
  }, [courseId, autoLoad]);

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback(
    (newFilters: Partial<LabFilters>) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      setState((prev) => ({
        ...prev,
        filters: updatedFilters,
        currentPage: 0, // Reset to first page when filters change
      }));
      loadLabs(0, updatedFilters);
    },
    [loadLabs, state.filters]
  );

  /**
   * Handle page change
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setState((prev) => ({ ...prev, currentPage: page }));
      loadLabs(page);
    },
    [loadLabs]
  );

  /**
   * Create a new lab
   */
  const createLab = useCallback(
    async (
      data: CreateLabRequest,
      onSuccess?: (lab: Lab) => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      if (!courseId) {
        const error = new Error("courseId is required to create lab");
        if (onError) onError(error);
        return;
      }

      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        const newLab = await labService.createLabForCourse(courseId, data);

        // Reload current page after creation
        await loadLabs(state.currentPage);

        setState((prev) => ({ ...prev, actionLoading: false }));

        if (onSuccess) onSuccess(newLab);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create lab");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        if (onError) onError(error);
      }
    },
    [courseId, loadLabs, state.currentPage]
  );

  /**
   * Update an existing lab
   */
  const updateLab = useCallback(
    async (
      id: string,
      data: UpdateLabRequest,
      onSuccess?: (lab: Lab) => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        const updatedLab = await labService.updateLab(id, data);

        // Update the lab in the current list
        setState((prev) => ({
          ...prev,
          labs: prev.labs.map((lab) =>
            lab.id === updatedLab.id ? updatedLab : lab
          ),
          actionLoading: false,
        }));

        if (onSuccess) onSuccess(updatedLab);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update lab");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        if (onError) onError(error);
      }
    },
    []
  );

  /**
   * Delete a lab
   */
  const deleteLab = useCallback(
    async (
      id: string,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        await labService.deleteLab(id);

        // Calculate new pagination state after deletion
        const newTotalItems = state.totalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / state.pageSize);
        const shouldGoToPreviousPage =
          state.currentPage >= newTotalPages && state.currentPage > 0;

        if (shouldGoToPreviousPage) {
          // Go to previous page if current page no longer exists
          await loadLabs(state.currentPage - 1);
        } else {
          // Reload current page
          await loadLabs(state.currentPage);
        }

        setState((prev) => ({ ...prev, actionLoading: false }));

        if (onSuccess) onSuccess();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to delete lab");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        if (onError) onError(error);
      }
    },
    [loadLabs, state.currentPage, state.totalItems, state.pageSize]
  );

  /**
   * Toggle lab active status
   */
  const toggleLabStatus = useCallback(
    async (
      lab: Lab,
      onSuccess?: (lab: Lab) => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        const updatedLab = await labService.toggleLabStatus(lab.id);

        // Update the lab in the current list
        setState((prev) => ({
          ...prev,
          labs: prev.labs.map((l) => (l.id === updatedLab.id ? updatedLab : l)),
          actionLoading: false,
        }));

        if (onSuccess) onSuccess(updatedLab);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to toggle lab status");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        if (onError) onError(error);
      }
    },
    []
  );

  /**
   * Clear error message
   */
  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset filters to initial state
   */
  const resetFilters = useCallback((): void => {
    handleFiltersChange(initialFilters);
  }, [handleFiltersChange]);

  /**
   * Refresh current page
   */
  const refresh = useCallback((): void => {
    loadLabs(state.currentPage);
  }, [loadLabs, state.currentPage]);

  return {
    // State
    ...state,

    // Actions
    loadLabs,
    createLab,
    updateLab,
    deleteLab,
    toggleLabStatus,
    handleFiltersChange,
    handlePageChange,
    clearError,
    resetFilters,
    refresh,
  };
};
