import { CreateLabRequest, Lab, UpdateLabRequest } from "@/types/lab";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const labService = {
  // Get all labs or filter by active status
  getLabs: async (isActivate?: boolean): Promise<Lab[]> => {
    const url = new URL(`${API_BASE_URL}/lab`);
    if (isActivate !== undefined) {
      url.searchParams.append('isActivate', isActivate.toString());
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch labs');
    }
    return response.json();
  },

  // Get lab by ID
  getLabById: async (id: string): Promise<Lab> => {
    const response = await fetch(`${API_BASE_URL}/lab/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lab');
    }
    return response.json();
  },

  // Create new lab
  createLab: async (lab: CreateLabRequest): Promise<Lab> => {
    const response = await fetch(`${API_BASE_URL}/lab`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lab),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create lab');
    }
    return response.json();
  },

  // Update lab
  updateLab: async (id: string, lab: UpdateLabRequest): Promise<Lab> => {
    const response = await fetch(`${API_BASE_URL}/lab/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lab),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update lab');
    }
    return response.json();
  },

  // Delete lab
  deleteLab: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/lab/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete lab');
    }
  },

  // Toggle lab status
  toggleLabStatus: async (id: string): Promise<Lab> => {
    const response = await fetch(`${API_BASE_URL}/lab/${id}/toggle-status`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to toggle lab status');
    }
    const result = await response.json();
    return result.lab;
  },

  // Get lab setup steps
  getLabSetupSteps: async (id: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/lab/${id}/setup-steps`);
    if (!response.ok) {
      throw new Error('Failed to fetch setup steps');
    }
    return response.json();
  },
};