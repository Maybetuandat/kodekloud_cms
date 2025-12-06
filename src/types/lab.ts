import { InstanceType } from "./instanceType";

export interface Lab {
  id: number;
  title: string;
  description?: string;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
  instanceType: InstanceType;
  namespace: string;
}

export interface CreateLabRequest {
  title: string;
  description?: string;
  estimatedTime: number;
  instanceTypeId: number;
}

export interface UpdateLabRequest extends CreateLabRequest {}
export interface PaginationParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
}

export interface PaginatedResponse<Lab> {
  data: Lab[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface LabFilters {
  search: string;
  status: null | true | false;
  sortBy: "newest" | "oldest" | "name" | "estimatedTime";
}
