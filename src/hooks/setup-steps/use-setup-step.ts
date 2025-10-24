import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import {
  SetupStep,
  CreateSetupStepRequest,
  UpdateSetupStepRequest,
} from "@/types/setupStep";
import { setupStepService } from "@/services/setupStepService";
import { LabTestResponse } from "@/types/labTest";

interface UseSetupStepsProps {
  labId: number;
  onTestSetupStep?: (
    testResult: LabTestResponse,
    websocketUrl: string,
    podName: string,
    labName: string
  ) => void;
}

export const useSetupSteps = ({
  labId,
  onTestSetupStep,
}: UseSetupStepsProps) => {
  const { t } = useTranslation(["common", "labs"]);
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteStepId, setDeleteStepId] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<SetupStep | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch setup steps
  const fetchSetupSteps = useCallback(async () => {
    try {
      setIsLoading(true);
      const stepsData = await setupStepService.getSetupStepsByLabId(labId);
      console.log("Fetched setup steps:", stepsData);
      setSetupSteps(stepsData);
    } catch (error) {
      console.error("Failed to fetch setup steps:", error);
      toast.error(t("labs:loadError"));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [labId, t]);

  useEffect(() => {
    if (labId) {
      fetchSetupSteps();
    }
  }, [labId, fetchSetupSteps]);

  // Open create dialog
  const handleCreateClick = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  // Create setup step
  const handleCreateSetupStep = useCallback(
    async (data: CreateSetupStepRequest) => {
      try {
        setActionLoading(true);
        const maxOrder = setupSteps.reduce(
          (max, step) => Math.max(max, step.stepOrder),
          0
        );

        const newStep = await setupStepService.createSetupStep(labId, {
          ...data,
          stepOrder: maxOrder + 1,
        });

        setSetupSteps((prev) => [...prev, newStep]);
        setIsCreateDialogOpen(false);
        toast.success(
          t("labs:setupStepCreateSuccess", { title: newStep.title })
        );
      } catch (error) {
        console.error("Failed to create setup step:", error);
        toast.error(t("labs:setupStepCreateError"));
        throw error;
      } finally {
        setTimeout(() => {
          setActionLoading(false);
        }, 200);
      }
    },
    [labId, setupSteps, t]
  );

  // Open edit dialog
  const handleEditClick = useCallback((step: SetupStep) => {
    setEditingStep(step);
  }, []);

  // Update setup step
  const handleUpdateSetupStep = useCallback(
    async (data: UpdateSetupStepRequest) => {
      try {
        setActionLoading(true);
        const updatedStep = await setupStepService.updateSetupStep(data);
        setSetupSteps((prev) =>
          prev.map((step) => (step.id === updatedStep.id ? updatedStep : step))
        );
        setEditingStep(null);
        toast.success(
          t("labs:setupStepUpdateSuccess", { title: updatedStep.title })
        );
      } catch (error) {
        console.error("Failed to update setup step:", error);
        toast.error(t("labs:setupStepUpdateError"));
        throw error;
      } finally {
        setTimeout(() => {
          setActionLoading(false);
        }, 200);
      }
    },
    [t]
  );

  // Move step up
  const handleMoveStepUp = useCallback(
    async (stepId: number) => {
      try {
        setActionLoading(true);
        const currentIndex = setupSteps.findIndex((s) => s.id === stepId);
        if (currentIndex <= 0) return;

        const currentStep = setupSteps[currentIndex];
        const previousStep = setupSteps[currentIndex - 1];

        await setupStepService.swapSetupSteps(currentStep.id, previousStep.id);

        fetchSetupSteps();

        toast.success(t("labs:setupStepMoveSuccess"));
      } catch (error) {
        console.error("Failed to move step up:", error);
        toast.error(t("labs:setupStepMoveError"));
      } finally {
        setActionLoading(false);
      }
    },
    [setupSteps, t]
  );

  // Move step down
  const handleMoveStepDown = useCallback(
    async (stepId: number) => {
      try {
        setActionLoading(true);
        const currentIndex = setupSteps.findIndex((s) => s.id === stepId);
        if (currentIndex >= setupSteps.length - 1) return;

        const currentStep = setupSteps[currentIndex];
        const nextStep = setupSteps[currentIndex + 1];

        await setupStepService.swapSetupSteps(currentStep.id, nextStep.id);

        fetchSetupSteps();

        toast.success(t("labs:setupStepMoveSuccess"));
      } catch (error) {
        console.error("Failed to move step down:", error);
        toast.error(t("labs:setupStepMoveError"));
      } finally {
        setActionLoading(false);
      }
    },
    [setupSteps, t]
  );

  // Open delete dialog
  const handleDeleteClick = useCallback((stepId: number) => {
    setDeleteStepId(stepId);
  }, []);

  // Confirm delete
  const handleConfirmDelete = useCallback(async () => {
    if (deleteStepId === null) return;

    try {
      setActionLoading(true);
      const step = setupSteps.find((s) => s.id === deleteStepId);
      if (!step) return;

      await setupStepService.deleteSetupStep(deleteStepId);
      fetchSetupSteps();
      setDeleteStepId(null);
      toast.success(t("labs:setupStepDeleteSuccess", { title: step.title }));
    } catch (error) {
      console.error("Failed to delete setup step:", error);
      toast.error(t("labs:setupStepDeleteError"));
    } finally {
      setActionLoading(false);
    }
  }, [deleteStepId, setupSteps, t]);

  // Cancel delete
  const handleCancelDelete = useCallback(() => {
    setDeleteStepId(null);
  }, []);

  // Close create dialog
  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  // Close edit dialog
  const handleCloseEditDialog = useCallback(() => {
    setEditingStep(null);
  }, []);

  return {
    // State
    setupSteps,
    isLoading,
    actionLoading,
    deleteStepId,
    editingStep,
    isCreateDialogOpen,

    // Fetch
    fetchSetupSteps,

    // Create
    handleCreateClick,
    handleCreateSetupStep,
    handleCloseCreateDialog,

    // Edit
    handleEditClick,
    handleUpdateSetupStep,
    handleCloseEditDialog,

    // Move
    handleMoveStepUp,
    handleMoveStepDown,

    // Delete
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
};
