import { api } from "@/lib/api";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  PaginatedResponse,
} from "@/types/category";

export const categoryService = {
  /**
   * Get all categories (without pagination)
   */
  getAllCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>("/categories");
  },

  /**
   * Get categories with pagination
   */
  getCategoriesPaginated: async (params: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PaginatedResponse<Category>> => {
    const queryParams: Record<string, any> = {
      page: (params.page ?? 1).toString(),
      pageSize: (params.pageSize ?? 10).toString(),
    };

    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    return api.get<PaginatedResponse<Category>>("/categories", queryParams);
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: number): Promise<Category> => {
    return api.get<Category>(`/categories/${id}`);
  },

  /**
   * Create new category
   */
  createCategory: async (
    category: CreateCategoryRequest
  ): Promise<Category> => {
    return api.post<Category>("/categories", category);
  },

  /**
   * Update existing category
   */
  updateCategory: async (
    id: number,
    category: UpdateCategoryRequest
  ): Promise<Category> => {
    return api.patch<Category>(`/categories/${id}`, category);
  },

  /**
   * Delete category
   */
  deleteCategory: async (id: number): Promise<void> => {
    return api.delete<void>(`/categories/${id}`);
  },
};
