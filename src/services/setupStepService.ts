import {
  SetupStep,
  CreateSetupStepRequest,
  UpdateSetupStepRequest,
} from "@/types/setupStep";
import { LabTestResponse } from "@/types/labTest";
import { api } from "@/lib/api";

const SETUP_STEPS_ENDPOINT = "/labs";

export const setupStepService = {
  // Get setup steps for a lab
  getSetupStepsByLabId: async (labId: number): Promise<SetupStep[]> => {
    console.log(`${SETUP_STEPS_ENDPOINT}/${labId}/setup-steps`);
    return api.get<SetupStep[]>(`${SETUP_STEPS_ENDPOINT}/${labId}/setup-steps`);
  },

  // Create setup step for a lab
  createSetupStep: async (
    labId: number,
    data: CreateSetupStepRequest
  ): Promise<SetupStep> => {
    return api.post<SetupStep>(`${SETUP_STEPS_ENDPOINT}/${labId}`, data);
  },

  // Create multiple setup steps
  createBatchSetupSteps: async (
    labId: number,
    setupSteps: CreateSetupStepRequest[]
  ): Promise<SetupStep[]> => {
    const result = await api.post<{ setupSteps: SetupStep[] }>(
      `${SETUP_STEPS_ENDPOINT}/batch/${labId}`,
      setupSteps
    );
    return result.setupSteps;
  },

  // Update setup step
  updateSetupStep: async (
    setupStep: UpdateSetupStepRequest
  ): Promise<SetupStep> => {
    return api.put<SetupStep>(SETUP_STEPS_ENDPOINT, setupStep);
  },

  // Delete setup step
  deleteSetupStep: async (setupStepId: number): Promise<void> => {
    return api.delete<void>(`${SETUP_STEPS_ENDPOINT}/${setupStepId}`);
  },

  // Delete multiple setup steps
  deleteBatchSetupSteps: async (setupStepIds: string[]): Promise<number> => {
    const result = await api.delete<{ deletedCount: number }>(
      `${SETUP_STEPS_ENDPOINT}/batch`
    );
    return result.deletedCount;
  },

  // Test setup step
  testSetupStep: async (setupStepId: string): Promise<LabTestResponse> => {
    return api.post<LabTestResponse>(
      `${SETUP_STEPS_ENDPOINT}/${setupStepId}/test`
    );
  },
};
