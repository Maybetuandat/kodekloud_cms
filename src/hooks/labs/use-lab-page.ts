import { useState, useCallback, useEffect } from 'react';
import { labService } from '@/services/labService';
import {
  Lab,
  PaginatedResponse,
  CreateLabRequest,
  UpdateLabRequest,
} from '@/types/lab';

export interface LabFilters {
  search: string;
  status: undefined | true | false;
  sortBy: "newest" | "oldest";
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

  // Filter state
  filters: LabFilters;

  // Error handling
  error: string | null;
}

interface UseLabPageActions {
  // Data fetching
  loadLabs: (page?: number, customFilters?: LabFilters) => Promise<void>;

  // CRUD operations
  createLab: (data: CreateLabRequest, onSuccess?: (lab: Lab) => void, onError?: (error: Error) => void) => Promise<void>;
  updateLab: (id: string, data: UpdateLabRequest, onSuccess?: (lab: Lab) => void, onError?: (error: Error) => void) => Promise<void>;
  deleteLab: (id: string, onSuccess?: () => void, onError?: (error: Error) => void) => Promise<void>;
  toggleLabStatus: (lab: Lab, onSuccess?: (lab: Lab) => void, onError?: (error: Error) => void) => Promise<void>;

  // Filter & Pagination handlers
  handleFiltersChange: (newFilters: LabFilters) => void;
  handlePageChange: (page: number) => void;

  // Utility functions
  clearError: () => void;
  resetFilters: () => void;
  refresh: () => void;
}

const initialFilters: LabFilters = {
  search: '',
  status: undefined,
  sortBy: 'newest',
};

const initialState: UseLabPageState = {
  labs: [],
  loading: true,
  actionLoading: false,
  currentPage: 0,
  pageSize: 12,
  totalPages: 0,
  totalItems: 0,
  filters: initialFilters,
  error: null,
};

/**
 * Map sort options to API fields
 */
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

/**
 * Custom hook for managing lab page operations
 * Handles fetching lab list, pagination, filtering, and CRUD operations
 *
 * @param options - Configuration options
 * @returns Object containing lab page state and action functions
 */
export const useLabPage = (): UseLabPageState & UseLabPageActions => {
  const [state, setState] = useState<UseLabPageState>(initialState);

  /**
   * Load labs with pagination and filters
   */
  const loadLabs = useCallback(
    async (page = state.currentPage, customFilters = state.filters): Promise<void> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const sortBy = mapSortByToApi(customFilters.sortBy);
        const sortDir = customFilters.sortBy === 'oldest' ? 'asc' : 'desc';
        const isActivate = customFilters.status === undefined ? undefined : customFilters.status;
        const search = customFilters.search.trim() || undefined;

        const response: PaginatedResponse<Lab> = await labService.getLabsPaginated({
          page,
          size: state.pageSize,
          sortBy,
          sortDir,
          isActivate,
          search,
        });

        setState(prev => ({
          ...prev,
          labs: response.data,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems,
          loading: false,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load labs';
        setState(prev => ({
          ...prev,
          error: errorMessage,
          labs: [],
          totalPages: 0,
          totalItems: 0,
          loading: false,
        }));
      }
    },
    [state.currentPage, state.filters, state.pageSize]
  );

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadLabs();
  }, []);

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback(
    (newFilters: LabFilters) => {
      setState(prev => ({
        ...prev,
        filters: newFilters,
        currentPage: 0, // Reset to first page when filters change
      }));
      loadLabs(0, newFilters);
    },
    [loadLabs]
  );

  /**
   * Handle page change
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setState(prev => ({ ...prev, currentPage: page }));
      loadLabs(page, state.filters);
    },
    [loadLabs, state.filters]
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
      setState(prev => ({ ...prev, actionLoading: true, error: null }));

      try {
        const newLab = await labService.createLab(data);

        // Reload current page after creation
        await loadLabs(state.currentPage, state.filters);

        setState(prev => ({ ...prev, actionLoading: false }));

        if (onSuccess) onSuccess(newLab);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create lab');
        setState(prev => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        if (onError) onError(error);
      }
    },
    [loadLabs, state.currentPage, state.filters]
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
      setState(prev => ({ ...prev, actionLoading: true, error: null }));

      try {
        const updatedLab = await labService.updateLab(id, data);

        // Update the lab in the current list
        setState(prev => ({
          ...prev,
          labs: prev.labs.map(lab => (lab.id === updatedLab.id ? updatedLab : lab)),
          actionLoading: false,
        }));

        if (onSuccess) onSuccess(updatedLab);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update lab');
        setState(prev => ({
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
      setState(prev => ({ ...prev, actionLoading: true, error: null }));

      try {
        await labService.deleteLab(id);

        // Calculate new pagination state after deletion
        const newTotalItems = state.totalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / state.pageSize);
        const shouldGoToPreviousPage = state.currentPage >= newTotalPages && state.currentPage > 0;

        if (shouldGoToPreviousPage) {
          // Go to previous page if current page no longer exists
          await loadLabs(state.currentPage - 1, state.filters);
        } else {
          // Reload current page
          await loadLabs(state.currentPage, state.filters);
        }

        setState(prev => ({ ...prev, actionLoading: false }));

        if (onSuccess) onSuccess();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete lab');
        setState(prev => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        if (onError) onError(error);
      }
    },
    [loadLabs, state.currentPage, state.filters, state.totalItems, state.pageSize]
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
      setState(prev => ({ ...prev, actionLoading: true, error: null }));

      try {
        const updatedLab = await labService.toggleLabStatus(lab.id);

        // Update the lab in the current list
        setState(prev => ({
          ...prev,
          labs: prev.labs.map(l => (l.id === updatedLab.id ? updatedLab : l)),
          actionLoading: false,
        }));

        if (onSuccess) onSuccess(updatedLab);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to toggle lab status');
        setState(prev => ({
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
    setState(prev => ({ ...prev, error: null }));
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
    loadLabs(state.currentPage, state.filters);
  }, [loadLabs, state.currentPage, state.filters]);

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
