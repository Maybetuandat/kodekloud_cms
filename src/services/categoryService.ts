// src/services/categoryService.ts
import { api } from "@/lib/api";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

const ENDPOINT = "/categories";

export const categoryService = {
  // Get all categories
  getAllCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>(`${ENDPOINT}`);
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<Category> => {
    return api.get<Category>(`${ENDPOINT}/${id}`);
  },

  // Create new category
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    return api.post<Category>(`${ENDPOINT}`, data);
  },

  // Update category
  updateCategory: async (
    id: number,
    data: UpdateCategoryRequest
  ): Promise<Category> => {
    return api.put<Category>(`${ENDPOINT}/${id}`, data);
  },

  // Delete category
  deleteCategory: async (id: number): Promise<void> => {
    return api.delete<void>(`${ENDPOINT}/${id}`);
  },
};
