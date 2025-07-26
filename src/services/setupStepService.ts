// src/services/setupStepService.ts
import { SetupStep, CreateSetupStepRequest, UpdateSetupStepRequest } from '@/types/setupStep';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const setupStepService = {
  // Create setup step for a lab
  createSetupStep: async (labId: string, setupStep: CreateSetupStepRequest): Promise<SetupStep> => {
    const response = await fetch(`${API_BASE_URL}/setup-step/${labId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(setupStep),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create setup step');
    }
    return response.json();
  },

  // Create multiple setup steps
  createBatchSetupSteps: async (labId: string, setupSteps: CreateSetupStepRequest[]): Promise<SetupStep[]> => {
    const response = await fetch(`${API_BASE_URL}/setup-step/batch/${labId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(setupSteps),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create batch setup steps');
    }
    const result = await response.json();
    return result.setupSteps;
  },

  // Update setup step
  updateSetupStep: async (setupStep: UpdateSetupStepRequest): Promise<SetupStep> => {
    const response = await fetch(`${API_BASE_URL}/setup-step`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(setupStep),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update setup step');
    }
    return response.json();
  },

  // Delete setup step
  deleteSetupStep: async (setupStepId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/setup-step/${setupStepId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete setup step');
    }
  },

  // Delete multiple setup steps
  deleteBatchSetupSteps: async (setupStepIds: string[]): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/setup-step/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(setupStepIds),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete batch setup steps');
    }
    const result = await response.json();
    return result.deletedCount;
  },
};