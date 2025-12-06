import { api } from "@/lib/api";
import {
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from "@/types/question";
import { ExcelQuestionRow } from "./excelService";

const QUESTIONS_ENDPOINT = "/questions";
const LABS_ENDPOINT = "/labs";

export const questionService = {
  // Get all questions (nếu có endpoint này)
  getAllQuestions: async (): Promise<Question[]> => {
    return api.get<Question[]>(`${QUESTIONS_ENDPOINT}`);
  },

  // Get questions by lab ID với pagination
  getQuestionsByLabIdWithPagination: async (
    labId: number,
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<{
    data: Question[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    return api.get<{
      data: Question[];
      currentPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }>(`${LABS_ENDPOINT}/${labId}/questions?${params.toString()}`);
  },

  // Get questions by lab ID (tất cả, không phân trang)
  getQuestionsByLabId: async (labId: number): Promise<Question[]> => {
    // Lấy tất cả questions bằng cách request với pageSize lớn
    const response = await api.get<{
      data: Question[];
      currentPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }>(`${LABS_ENDPOINT}/${labId}/questions?page=1&pageSize=1000`);

    return response.data;
  },

  // Get question by ID
  getQuestionById: async (id: number): Promise<Question> => {
    return api.get<Question>(`${QUESTIONS_ENDPOINT}/${id}`);
  },

  // Create new question in a lab
  createQuestion: async (
    labId: number,
    data: CreateQuestionRequest
  ): Promise<Question> => {
    return api.post<Question>(`${LABS_ENDPOINT}/${labId}/questions`, data);
  },

  // Update question
  updateQuestion: async (
    id: number,
    data: UpdateQuestionRequest
  ): Promise<Question> => {
    return api.patch<Question>(`${QUESTIONS_ENDPOINT}/${id}`, data);
  },

  // Delete question
  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete<{ deleted: boolean }>(`${QUESTIONS_ENDPOINT}/${id}`);
  },

  // Bulk delete questions
  bulkDeleteQuestions: async (ids: number[]): Promise<void> => {
    // Xóa từng question một vì backend không có bulk delete endpoint
    await Promise.all(
      ids.map((id) => api.delete(`${QUESTIONS_ENDPOINT}/${id}`))
    );
  },

  // Bulk create questions from Excel
  bulkCreateQuestionsFromExcel: async (
    labId: number,
    questions: ExcelQuestionRow[]
  ): Promise<any> => {
    console.log("Debug questions", questions);
    const response = await api.post<Question[]>(
      `${LABS_ENDPOINT}/${labId}/questions/bulk`,
      questions
    );
    console.log("Debug response", response);
    return response;
  },
};
