export interface InstanceType {
  id: number;
  name: string;
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  description?: string;
}

export interface CreateInstanceTypeRequest {
  name: string;
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  description?: string;
}

export interface UpdateInstanceTypeRequest {
  name?: string;
  cpuCores?: number;
  memoryGb?: number;
  storageGb?: number;
  description?: string;
}
