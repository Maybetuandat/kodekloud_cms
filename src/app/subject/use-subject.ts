import { SubjectService } from "@/services/subjectService";
import {
  CreateSubjectRequest,
  Subject,
  UpdateSubjectRequest,
} from "@/types/subject";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface SubjectFilters {
  search: string;
  status: undefined | true | false;
  sortBy: "newest" | "oldest" | "name";
}

interface UseSubjectPageState {
  // Subject data
  subjects: Subject[];
  filteredsubjects: Subject[];

  // Loading states
  loading: boolean;
  actionLoading: boolean;

  // Filter state
  filters: SubjectFilters;
  localSearchTerm: string;

  // Dialog states
  formDialogOpen: boolean;
  deleteDialogOpen: boolean;
  editingSubject: Subject | null;
  deletingSubject: Subject | null;

  // Error handling
  error: string | null;
}

interface UseSubjectPageActions {
  // Data fetching
  loadSubjects: () => Promise<void>;

  // CRUD operations with callbacks
  handleCreateSubject: (data: CreateSubjectRequest) => Promise<void>;
  handleUpdateSubject: (data: UpdateSubjectRequest) => Promise<void>;
  handleDeleteSubject: () => Promise<void>;

  // Dialog handlers
  openCreateDialog: () => void;
  openEditDialog: (Subject: Subject) => void;
  openDeleteDialog: (Subject: Subject) => void;
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

const initialFilters: SubjectFilters = {
  search: "",
  status: undefined,
  sortBy: "newest",
};

const initialState: UseSubjectPageState = {
  subjects: [],
  filteredsubjects: [],
  loading: true,
  actionLoading: false,
  filters: initialFilters,
  localSearchTerm: "",
  formDialogOpen: false,
  deleteDialogOpen: false,
  editingSubject: null,
  deletingSubject: null,
  error: null,
};

export const useSubjectPage = (): UseSubjectPageState &
  UseSubjectPageActions => {
  const { t } = useTranslation("subjects");
  const [state, setState] = useState<UseSubjectPageState>(initialState);

  const loadSubjects = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await SubjectService.getAllSubjects();

      setState((prev) => ({
        ...prev,
        subjects: response,
        loading: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load subjects";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        subjects: [],
        loading: false,
      }));
    }
  }, []);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  /**
   * Apply filters to subjects (Frontend filtering)
   */
  const filteredsubjects = useMemo(() => {
    let filtered = [...state.subjects];

    // Search filter (search in frontend)
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.title.toLowerCase().includes(searchLower) ||
          cat.description.toLowerCase().includes(searchLower) ||
          cat.code.toLowerCase().includes(searchLower)
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
  }, [state.subjects, state.filters]);

  /**
   * Update filtered subjects in state
   */
  useEffect(() => {
    setState((prev) => ({ ...prev, filteredsubjects }));
  }, [filteredsubjects]);

  /**
   * Handle create Subject
   */
  const handleCreateSubject = useCallback(
    async (data: CreateSubjectRequest): Promise<void> => {
      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        console.log("Create Subject in Hook", data);
        const newSubject = await SubjectService.createSubject(data);

        // Reload subjects after creation
        await loadSubjects();

        setState((prev) => ({
          ...prev,
          actionLoading: false,
          formDialogOpen: false,
        }));

        toast.success(t("subjects.createSuccess", { name: newSubject.title }));
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create Subject");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        toast.error(t("subjects.createError"), {
          description: error.message,
        });
      }
    },
    [loadSubjects, t]
  );

  /**
   * Handle update Subject
   */
  const handleUpdateSubject = useCallback(
    async (data: UpdateSubjectRequest): Promise<void> => {
      if (!state.editingSubject) return;

      setState((prev) => ({ ...prev, actionLoading: true, error: null }));

      try {
        const updatedSubject = await SubjectService.updateSubject(
          state.editingSubject.id,
          data
        );

        // Update the Subject in the current list
        setState((prev) => ({
          ...prev,
          subjects: prev.subjects.map((cat) =>
            cat.id === updatedSubject.id ? updatedSubject : cat
          ),
          actionLoading: false,
          formDialogOpen: false,
          editingSubject: null,
        }));

        toast.success(
          t("subjects.updateSuccess", { name: updatedSubject.title })
        );
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update Subject");
        setState((prev) => ({
          ...prev,
          error: error.message,
          actionLoading: false,
        }));

        toast.error(t("subjects.updateError"), {
          description: error.message,
        });
      }
    },
    [state.editingSubject, t]
  );

  /**
   * Handle delete Subject
   */
  const handleDeleteSubject = useCallback(async (): Promise<void> => {
    if (!state.deletingSubject) return;

    setState((prev) => ({ ...prev, actionLoading: true, error: null }));

    try {
      await SubjectService.deleteSubject(state.deletingSubject.id);

      // Reload subjects after deletion
      await loadSubjects();

      const deletedSubjectTitle = state.deletingSubject.title;

      setState((prev) => ({
        ...prev,
        actionLoading: false,
        deleteDialogOpen: false,
        deletingSubject: null,
      }));

      toast.success(t("subjects.deleteSuccess", { name: deletedSubjectTitle }));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete Subject");
      setState((prev) => ({
        ...prev,
        error: error.message,
        actionLoading: false,
      }));

      toast.error(t("subjects.deleteError"), {
        description: error.message,
      });
    }
  }, [state.deletingSubject, loadSubjects, t]);

  /**
   * Open create dialog
   */
  const openCreateDialog = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      editingSubject: null,
      formDialogOpen: true,
    }));
  }, []);

  /**
   * Open edit dialog
   */
  const openEditDialog = useCallback((Subject: Subject): void => {
    setState((prev) => ({
      ...prev,
      editingSubject: Subject,
      formDialogOpen: true,
    }));
  }, []);

  /**
   * Open delete dialog
   */
  const openDeleteDialog = useCallback((Subject: Subject): void => {
    setState((prev) => ({
      ...prev,
      deletingSubject: Subject,
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
    loadSubjects();
  }, [loadSubjects]);

  return {
    // State
    ...state,

    // Actions
    loadSubjects,
    handleCreateSubject,
    handleUpdateSubject,
    handleDeleteSubject,
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
