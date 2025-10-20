// src/hooks/categories/use-category-page.ts
import { useState, useCallback, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

export interface CategoryFilters {
  search: string;
  status: undefined | true | false;
  sortBy: "newest" | "oldest" | "name";
}

interface UseCategoryPageState {
  // Category data
  categories: Category[];

  // Loading states
  loading: boolean;
  actionLoading: boolean;

  // Filter state
  filters: CategoryFilters;

  // Error handling
  error: string | null;
}

interface UseCategoryPageActions {
  // Data fetching
  loadCategories: () => Promise<void>;

  // CRUD operations
  createCategory: (
    data: CreateCategoryRequest,
    onSuccess?: (category: Category) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;

  updateCategory: (
    id: number,
    data: UpdateCategoryRequest,
    onSuccess?: (category: Category) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;

  deleteCategory: (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;

  // Filter handlers
  handleFiltersChange: (newFilters: CategoryFilters) => void;

  // Utility functions
  clearError: () => void;
  resetFilters: () => void;
  refresh: () => void;
}

const initialFilters: CategoryFilters = {
  search: "",
  status: undefined,
  sortBy: "newest",
};

const initialState: UseCategoryPageState = {
  categories: [],
  loading: true,
  actionLoading: false,
  filters: initialFilters,
  error: null,
};

/**
 * Custom hook for managing category page operations
 * Handles fetching category list, filtering, and CRUD operations
 *
 * @returns Object containing category page state and action functions
 */
export const useCategoryPage = (): UseCategoryPageState &
  UseCategoryPageActions => {
  const [state, setState] = useState<UseCategoryPageState>(initialState);

  /**
   * Load all categories
   */
  const loadCategories = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await categoryService.getAllCategories();

      setState((prev) => ({
        ...prev,
        categories: response,
        loading: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load categories";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        categories: [],
        loading: false,
      }));
    }
  }, []);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback((newFilters: CategoryFilters) => {
    setState((prev) => ({
      ...prev,
      filters: newFilters,
    }));
  }, []);

  /**
   * Create a new category
   */
  const createCategory = useCallback(
    async (
      data: CreateCategoryRequest,
      onSuccess?: (category: Category) => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        const newCategory = await categoryService.createCategory(data);

        // Reload categories after creation
        await loadCategories();

        setState((prev) => ({ ...prev, actionLoading: false }));

        if (onSuccess) onSuccess(newCategory);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create category");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        if (onError) onError(error);
      }
    },
    [loadCategories]
  );

  /**
   * Update an existing category
   */
  const updateCategory = useCallback(
    async (
      id: number,
      data: UpdateCategoryRequest,
      onSuccess?: (category: Category) => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        const updatedCategory = await categoryService.updateCategory(id, data);

        // Update the category in the current list
        setState((prev) => ({
          ...prev,
          categories: prev.categories.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          ),
          actionLoading: false,
        }));

        if (onSuccess) onSuccess(updatedCategory);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update category");
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
   * Delete a category
   */
  const deleteCategory = useCallback(
    async (
      id: number,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        await categoryService.deleteCategory(id);

        // Reload categories after deletion
        await loadCategories();

        setState((prev) => ({ ...prev, actionLoading: false }));

        if (onSuccess) onSuccess();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to delete category");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        if (onError) onError(error);
      }
    },
    [loadCategories]
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
   * Refresh current data
   */
  const refresh = useCallback((): void => {
    loadCategories();
  }, [loadCategories]);

  return {
    // State
    ...state,

    // Actions
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    handleFiltersChange,
    clearError,
    resetFilters,
    refresh,
  };
};
