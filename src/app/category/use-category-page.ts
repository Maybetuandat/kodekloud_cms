import { useState, useCallback, useEffect } from "react";
import { categoryService } from "@/services/categoryService";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

interface UseCategoryPageState {
  categories: Category[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

interface UseCategoryPageActions {
  loadCategories: () => Promise<void>;
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

  refresh: () => void;
  clearError: () => void;
}

export const useCategoryPage = (): UseCategoryPageState &
  UseCategoryPageActions => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load categories from API
   */
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getAllCategories();

      setCategories(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load categories";
      setError(errorMessage);
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load categories when dependencies change
   */
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /**
   * Helper function to perform action and refresh data
   */
  const performActionAndRefresh = async (
    action: () => Promise<any>,
    onSuccessCallback?: (result?: any) => void,
    onErrorCallback?: (error: Error) => void
  ) => {
    setActionLoading(true);
    try {
      const result = await action();
      onSuccessCallback?.(result);
      await loadCategories();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("An unknown error occurred");
      onErrorCallback?.(error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Create new category
   */
  const createCategory = async (
    data: CreateCategoryRequest,
    onSuccess?: (category: Category) => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => categoryService.createCategory(data),
      onSuccess,
      onError
    );
  };

  /**
   * Update existing category
   */
  const updateCategory = async (
    id: number,
    data: UpdateCategoryRequest,
    onSuccess?: (category: Category) => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => categoryService.updateCategory(id, data),
      onSuccess,
      onError
    );
  };

  /**
   * Delete category
   */
  const deleteCategory = async (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => categoryService.deleteCategory(id),
      onSuccess,
      onError
    );
  };

  /**
   * Manual refresh
   */
  const refresh = () => {
    loadCategories();
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    categories,
    loading,
    actionLoading,

    error,
    // Actions
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    refresh,
    clearError,
  };
};
