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
  const { t } = useTranslation("common");
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch setup steps
  const fetchSetupSteps = useCallback(async () => {
    try {
      const stepsData = await setupStepService.getSetupStepsByLabId(labId);
      console.log("Fetched setup steps:", stepsData);
      setSetupSteps(stepsData);
    } catch (error) {
      console.error("Failed to fetch setup steps:", error);
      toast.error(t("labs.loadError"));
      throw error;
    }
  }, [labId, t]);

  useEffect(() => {
    if (labId) {
      fetchSetupSteps();
    }
  }, [labId, fetchSetupSteps]);

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
        toast.success(
          t("labs.setupStepCreateSuccess", { title: newStep.title })
        );
      } catch (error) {
        console.error("Failed to create setup step:", error);
        toast.error(t("labs.setupStepCreateError"));
        throw error;
      } finally {
        setTimeout(() => {
          setActionLoading(false);
        }, 200);
      }
    },
    [labId, setupSteps, t]
  );

  // Update setup step
  const handleUpdateSetupStep = useCallback(
    async (data: UpdateSetupStepRequest) => {
      try {
        setActionLoading(true);
        const updatedStep = await setupStepService.updateSetupStep(data);
        setSetupSteps((prev) =>
          prev.map((step) => (step.id === updatedStep.id ? updatedStep : step))
        );
        toast.success(
          t("labs.setupStepUpdateSuccess", { title: updatedStep.title })
        );
      } catch (error) {
        console.error("Failed to update setup step:", error);
        toast.error(t("labs.setupStepUpdateError"));
        throw error;
      } finally {
        setTimeout(() => {
          setActionLoading(false);
        }, 200);
      }
    },
    [t]
  );

  // Test setup step

  // Delete setup step
  const handleDeleteSetupStep = useCallback(
    async (step: SetupStep) => {
      try {
        setActionLoading(true);
        await setupStepService.deleteSetupStep(step.id);
        setSetupSteps((prev) => prev.filter((s) => s.id !== step.id));
        toast.success(t("labs.setupStepDeleteSuccess", { title: step.title }));
      } catch (error) {
        console.error("Failed to delete setup step:", error);
        toast.error(t("labs.setupStepDeleteError"));
      } finally {
        setActionLoading(false);
      }
    },
    [t]
  );

  return {
    setupSteps,
    actionLoading,
    fetchSetupSteps,
    handleCreateSetupStep,
    handleUpdateSetupStep,

    handleDeleteSetupStep,
  };
};
