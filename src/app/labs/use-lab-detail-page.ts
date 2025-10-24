import { useState, useCallback, useEffect } from "react";
import { labService } from "@/services/labService";
import { Lab, UpdateLabRequest } from "@/types/lab";
import { SetupStep } from "@/types/setupStep";
import { Question } from "@/types/question";
export interface QuestionFilters {
  search: string;
  status: undefined | true | false;
  sortBy: "newest" | "oldest";
}

interface UseLabDetailPageState {
  // Lab data
  lab: Lab | null;
  isLoadingLab: boolean;

  // Setup steps data
  setupSteps: SetupStep[];
  isLoadingSetupSteps: boolean;

  // Questions data
  questions: Question[];
  isLoadingQuestions: boolean;

  // Pagination state for questions
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;

  // Filter state for questions
  filters: QuestionFilters;

  // Error handling
  error: string | null;
}

const initialFilters: QuestionFilters = {
  search: "",
  status: undefined,
  sortBy: "newest",
};

const initialState: UseLabDetailPageState = {
  lab: null,
  isLoadingLab: false,
  setupSteps: [],
  isLoadingSetupSteps: false,
  questions: [],
  isLoadingQuestions: false,
  currentPage: 0,
  pageSize: 10,
  totalPages: 0,
  totalItems: 0,
  filters: initialFilters,
  error: null,
};

export const useLabDetailPage = (labId: number) => {
  const [state, setState] = useState<UseLabDetailPageState>(initialState);

  /**
   * Load lab details
   */
  const loadLab = useCallback(async (): Promise<void> => {
    if (!labId) return;

    try {
      setState((prev) => ({ ...prev, isLoadingLab: true, error: null }));

      const labData = await labService.getLabById(labId);

      setState((prev) => ({
        ...prev,
        lab: labData,
        isLoadingLab: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load lab";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        lab: null,
        isLoadingLab: false,
      }));
    }
  }, [labId]);
  useEffect(() => {
    if (labId) {
      loadLab();
    }
  }, [labId]);

  /**
   * Update lab
   */
  const updateLab = useCallback(
    async (data: UpdateLabRequest): Promise<void> => {
      if (!labId) return;

      const updatedLab = await labService.updateLab(labId, data);
      setState((prev) => ({
        ...prev,
        lab: updatedLab,
      }));
    },
    [labId]
  );
  const toggleLabStatus = useCallback(async (): Promise<void> => {
    if (!labId) return;

    const updatedLab = await labService.toggleLabStatus(labId);
    setState((prev) => ({
      ...prev,
      lab: updatedLab,
    }));
  }, [labId]);

  const deleteLab = useCallback(
    async (
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      if (!labId) return;

      try {
        await labService.deleteLab(labId);
        if (onSuccess) onSuccess();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to delete lab");
        if (onError) onError(error);
      }
    },
    [labId]
  );

  return {
    // Lab state
    lab: state.lab,
    isLoadingLab: state.isLoadingLab,

    // Setup steps state
    setupSteps: state.setupSteps,
    isLoadingSetupSteps: state.isLoadingSetupSteps,

    // Questions state
    questions: state.questions,
    isLoadingQuestions: state.isLoadingQuestions,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalItems: state.totalItems,
    pageSize: state.pageSize,

    // Lab operations
    updateLab,
    toggleLabStatus,
    deleteLab,
    error: state.error,
  };
};
