export interface Category {
  id: number;
  name: string;
  slug: string;
  descriptions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  descriptions?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  descriptions?: string;
}

export interface CategoryFilters {
  search: string;
  sortBy: "newest" | "oldest" | "name";
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
