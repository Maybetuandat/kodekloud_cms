export interface Lab {
  id: number;
  name: string;
  description?: string;
  baseImage: string;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateLabRequest {
  name: string;
  description?: string;
  estimatedTime: number;
}

export interface UpdateLabRequest extends CreateLabRequest {}
export interface PaginationParams {
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
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

// Update existing LabFilters to include pagination
export interface ExtendedLabFilters extends LabFilters {
  page: number;
  size: number;
}
