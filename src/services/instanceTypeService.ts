import { api } from "@/lib/api";
import {
  CreateInstanceTypeRequest,
  InstanceType,
  UpdateInstanceTypeRequest,
} from "@/types/instanceType";

const ENDPOINT = "/instance-types";

export const instanceTypeService = {
  // Get all instance types
  getAllInstanceTypes: async (): Promise<InstanceType[]> => {
    return api.get<InstanceType[]>(`${ENDPOINT}`);
  },

  // Get instance type by ID
  getInstanceTypeById: async (id: number): Promise<InstanceType> => {
    return api.get<InstanceType>(`${ENDPOINT}/${id}`);
  },

  // Create new instance type
  createInstanceType: async (
    data: CreateInstanceTypeRequest
  ): Promise<InstanceType> => {
    return api.post<InstanceType>(`${ENDPOINT}`, data);
  },

  // Update instance type
  updateInstanceType: async (
    id: number,
    data: UpdateInstanceTypeRequest
  ): Promise<InstanceType> => {
    return api.patch<InstanceType>(`${ENDPOINT}/${id}`, data);
  },

  // Delete instance type
  deleteInstanceType: async (id: number): Promise<void> => {
    return api.delete<void>(`${ENDPOINT}/${id}`);
  },
};
