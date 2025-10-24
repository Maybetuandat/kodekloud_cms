// src/services/questionService.ts
import { api } from "@/lib/api";
import {
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from "@/types/question";

const ENDPOINT = "/questions";

export const questionService = {
  // Get all questions
  getAllQuestions: async (): Promise<Question[]> => {
    return api.get<Question[]>(`${ENDPOINT}`);
  },

  // Get questions by lab ID
  getQuestionsByLabId: async (labId: number): Promise<Question[]> => {
    return api.get<Question[]>(`${ENDPOINT}/lab/${labId}`);
  },

  // Get question by ID
  getQuestionById: async (id: number): Promise<Question> => {
    return api.get<Question>(`${ENDPOINT}/${id}`);
  },

  // Create new question
  createQuestion: async (data: CreateQuestionRequest): Promise<Question> => {
    return api.post<Question>(`${ENDPOINT}`, data);
  },

  // Update question
  updateQuestion: async (
    id: number,
    data: UpdateQuestionRequest
  ): Promise<Question> => {
    return api.put<Question>(`${ENDPOINT}/${id}`, data);
  },

  // Delete question
  deleteQuestion: async (id: number): Promise<void> => {
    return api.delete<void>(`${ENDPOINT}/${id}`);
  },

  // Bulk delete questions
  bulkDeleteQuestions: async (ids: number[]): Promise<void> => {
    return api.post<void>(`${ENDPOINT}/bulk-delete`, { ids });
  },
};
