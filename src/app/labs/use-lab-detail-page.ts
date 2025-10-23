import { useState, useCallback, useEffect } from "react";
import { labService } from "@/services/labService";
import { setupStepService } from "@/services/setupStepService";

import { Lab, UpdateLabRequest } from "@/types/lab";
import {
  SetupStep,
  CreateSetupStepRequest,
  UpdateSetupStepRequest,
} from "@/types/setupStep";
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

  /**
   * Load setup steps
   */
  const loadSetupSteps = useCallback(async (): Promise<void> => {
    if (!labId) return;

    try {
      setState((prev) => ({ ...prev, isLoadingSetupSteps: true }));

      const steps = await setupStepService.getSetupStepsByLabId(labId);

      setState((prev) => ({
        ...prev,
        setupSteps: steps,
        isLoadingSetupSteps: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        setupSteps: [],
        isLoadingSetupSteps: false,
      }));
    }
  }, [labId]);

  /**
   * Load questions with pagination and filters
   */

  /**
   * Initial load on mount
   */
  useEffect(() => {
    if (labId) {
      loadLab();
      loadSetupSteps();
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

  /**
   * Toggle lab status
   */
  const toggleLabStatus = useCallback(async (): Promise<void> => {
    if (!labId) return;

    const updatedLab = await labService.toggleLabStatus(labId);
    setState((prev) => ({
      ...prev,
      lab: updatedLab,
    }));
  }, [labId]);

  /**
   * Delete lab
   */
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

  /**
   * Create setup step
   */
  const createSetupStep = useCallback(
    async (
      data: CreateSetupStepRequest,
      onSuccess?: (step: SetupStep) => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      if (!labId) return;

      try {
        const newStep = await setupStepService.createSetupStep(labId, data);
        await loadSetupSteps();
        if (onSuccess) onSuccess(newStep);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create setup step");
        if (onError) onError(error);
      }
    },
    [labId, loadSetupSteps]
  );

  /**
   * Update setup step
   */
  const updateSetupStep = useCallback(
    async (
      stepId: number,
      data: UpdateSetupStepRequest,
      onSuccess?: (step: SetupStep) => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      try {
        const updatedStep = await setupStepService.updateSetupStep(
          stepId,
          data
        );
        await loadSetupSteps();
        if (onSuccess) onSuccess(updatedStep);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update setup step");
        if (onError) onError(error);
      }
    },
    [loadSetupSteps]
  );

  /**
   * Delete setup step
   */
  const deleteSetupStep = useCallback(
    async (
      stepId: number,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ): Promise<void> => {
      try {
        await setupStepService.deleteSetupStep(stepId);
        await loadSetupSteps();
        if (onSuccess) onSuccess();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to delete setup step");
        if (onError) onError(error);
      }
    },
    [loadSetupSteps]
  );

  /**
   * Move setup step up
   */
  const moveSetupStepUp = useCallback(
    async (stepId: number): Promise<void> => {
      await setupStepService.moveStepUp(stepId);
      await loadSetupSteps();
    },
    [loadSetupSteps]
  );

  /**
   * Move setup step down
   */
  const moveSetupStepDown = useCallback(
    async (stepId: number): Promise<void> => {
      await setupStepService.moveStepDown(stepId);
      await loadSetupSteps();
    },
    [loadSetupSteps]
  );

  /**
   * Create question
   */

  /**
   * Update question
   */

  /**


  /**
   * Handle filter changes
   */

  /**
   * Handle page change
   */

  /**
   * Handle page size change
   */

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

    // Setup step operations
    createSetupStep,
    updateSetupStep,
    deleteSetupStep,
    moveSetupStepUp,
    moveSetupStepDown,

    // Question operations

    // Error
    error: state.error,
  };
};
