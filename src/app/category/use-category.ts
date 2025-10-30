import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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
  filteredCategories: Category[];

  // Loading states
  loading: boolean;
  actionLoading: boolean;

  // Filter state
  filters: CategoryFilters;
  localSearchTerm: string;

  // Dialog states
  formDialogOpen: boolean;
  deleteDialogOpen: boolean;
  editingCategory: Category | null;
  deletingCategory: Category | null;

  // Error handling
  error: string | null;
}

interface UseCategoryPageActions {
  // Data fetching
  loadCategories: () => Promise<void>;

  // CRUD operations with callbacks
  handleCreateCategory: (data: CreateCategoryRequest) => Promise<void>;
  handleUpdateCategory: (data: UpdateCategoryRequest) => Promise<void>;
  handleDeleteCategory: () => Promise<void>;

  // Dialog handlers
  openCreateDialog: () => void;
  openEditDialog: (category: Category) => void;
  openDeleteDialog: (category: Category) => void;
  setFormDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;

  // Filter handlers
  handleSearchChange: (value: string) => void;
  handleSearchClear: () => void;
  handleSortChange: (value: string) => void;

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
  filteredCategories: [],
  loading: true,
  actionLoading: false,
  filters: initialFilters,
  localSearchTerm: "",
  formDialogOpen: false,
  deleteDialogOpen: false,
  editingCategory: null,
  deletingCategory: null,
  error: null,
};

/**
 * Custom hook for managing category page operations
 * Handles all business logic including fetching, filtering, CRUD operations, and UI state
 *
 * @returns Object containing category page state and action functions
 */
export const useCategoryPage = (): UseCategoryPageState &
  UseCategoryPageActions => {
  const { t } = useTranslation("categories");
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
   * Apply filters to categories (Frontend filtering)
   */
  const filteredCategories = useMemo(() => {
    let filtered = [...state.categories];

    // Search filter (search in frontend)
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.title.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower) ||
          cat.slug?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.filters.sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [state.categories, state.filters]);

  /**
   * Update filtered categories in state
   */
  useEffect(() => {
    setState((prev) => ({ ...prev, filteredCategories }));
  }, [filteredCategories]);

  /**
   * Handle create category
   */
  const handleCreateCategory = useCallback(
    async (data: CreateCategoryRequest): Promise<void> => {
      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        const newCategory = await categoryService.createCategory(data);

        // Reload categories after creation
        await loadCategories();

        setState((prev) => ({
          ...prev,
          actionLoading: false,
          formDialogOpen: false,
        }));

        toast.success(
          t("categories.createSuccess", { name: newCategory.title })
        );
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create category");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        toast.error(t("categories.createError"), {
          description: error.message,
        });
      }
    },
    [loadCategories, t]
  );

  /**
   * Handle update category
   */
  const handleUpdateCategory = useCallback(
    async (data: UpdateCategoryRequest): Promise<void> => {
      if (!state.editingCategory) return;

      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        const updatedCategory = await categoryService.updateCategory(
          state.editingCategory.id,
          data
        );

        // Update the category in the current list
        setState((prev) => ({
          ...prev,
          categories: prev.categories.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          ),
          actionLoading: false,
          formDialogOpen: false,
          editingCategory: null,
        }));

        toast.success(
          t("categories.updateSuccess", { name: updatedCategory.title })
        );
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update category");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        toast.error(t("categories.updateError"), {
          description: error.message,
        });
      }
    },
    [state.editingCategory, t]
  );

  /**
   * Handle delete category
   */
  const handleDeleteCategory = useCallback(async (): Promise<void> => {
    if (!state.deletingCategory) return;

    setState((prev) => ({ ...prev, actionLoading: true, error: null }));

    try {
      await categoryService.deleteCategory(state.deletingCategory.id);

      // Reload categories after deletion
      await loadCategories();

      const deletedCategoryTitle = state.deletingCategory.title;

      setState((prev) => ({
        ...prev,
        actionLoading: false,
        deleteDialogOpen: false,
        deletingCategory: null,
      }));

      toast.success(
        t("categories.deleteSuccess", { name: deletedCategoryTitle })
      );
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete category");
      setState((prev) => ({
        ...prev,
        error: error.message,
        actionLoading: false,
      }));

      toast.error(t("categories.deleteError"), {
        description: error.message,
      });
    }
  }, [state.deletingCategory, loadCategories, t]);

  /**
   * Open create dialog
   */
  const openCreateDialog = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      editingCategory: null,
      formDialogOpen: true,
    }));
  }, []);

  /**
   * Open edit dialog
   */
  const openEditDialog = useCallback((category: Category): void => {
    setState((prev) => ({
      ...prev,
      editingCategory: category,
      formDialogOpen: true,
    }));
  }, []);

  /**
   * Open delete dialog
   */
  const openDeleteDialog = useCallback((category: Category): void => {
    setState((prev) => ({
      ...prev,
      deletingCategory: category,
      deleteDialogOpen: true,
    }));
  }, []);

  /**
   * Set form dialog open state
   */
  const setFormDialogOpen = useCallback((open: boolean): void => {
    setState((prev) => ({ ...prev, formDialogOpen: open }));
  }, []);

  /**
   * Set delete dialog open state
   */
  const setDeleteDialogOpen = useCallback((open: boolean): void => {
    setState((prev) => ({ ...prev, deleteDialogOpen: open }));
  }, []);

  /**
   * Handle search change (instant search in frontend)
   */
  const handleSearchChange = useCallback((value: string): void => {
    setState((prev) => ({
      ...prev,
      localSearchTerm: value,
      filters: {
        ...prev.filters,
        search: value,
      },
    }));
  }, []);

  /**
   * Handle search clear
   */
  const handleSearchClear = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      localSearchTerm: "",
      filters: {
        ...prev.filters,
        search: "",
      },
    }));
  }, []);

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((value: string): void => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        sortBy: value as "newest" | "oldest" | "name",
      },
    }));
  }, []);

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
    setState((prev) => ({
      ...prev,
      filters: initialFilters,
      localSearchTerm: "",
    }));
  }, []);

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
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    setFormDialogOpen,
    setDeleteDialogOpen,
    handleSearchChange,
    handleSearchClear,
    handleSortChange,
    clearError,
    resetFilters,
    refresh,
  };
};
