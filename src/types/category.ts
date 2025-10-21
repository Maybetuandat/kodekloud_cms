export interface Category {
  id: number;
  title: string;
  description?: string;
  slug?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  title: string;
  description?: string;
  slug?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}
