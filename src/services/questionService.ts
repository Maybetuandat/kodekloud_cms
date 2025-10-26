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
    return api.post<Question>(`${LABS_ENDPOINT}/${labId}/questions`, {
      question: data.question,
      hint: data.hint,
      solution: data.solution,
    });
  },

  // Update question
  updateQuestion: async (
    id: number,
    data: UpdateQuestionRequest
  ): Promise<Question> => {
    return api.put<Question>(`${QUESTIONS_ENDPOINT}/${id}`, data);
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
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ question: string; error: string }>;
  }> => {
    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ question: string; error: string }> = [];

    for (const questionData of questions) {
      try {
        console.log("Creating question:", questionData.question);

        // 1. Tạo question thông qua endpoint của lab
        const createdQuestion = await api.post<Question>(
          `${LABS_ENDPOINT}/${labId}/questions`,
          {
            question: questionData.question,
            hint: questionData.hint,
            solution: questionData.solution,
          }
        );

        console.log("Question created with ID:", createdQuestion.id);

        const questionId = createdQuestion.id;

        // 2. Tạo từng answer một cho question (tuần tự để dễ debug)
        for (const answer of questionData.answers) {
          try {
            console.log(
              `Creating answer for question ${questionId}:`,
              answer.content
            );

            await api.post(`${QUESTIONS_ENDPOINT}/${questionId}/answers`, {
              content: answer.content,
              isCorrect: answer.isCorrect,
            });

            console.log(
              `Answer created successfully for question ${questionId}`
            );
          } catch (answerError) {
            console.error(
              `Failed to create answer for question ${questionId}:`,
              answerError
            );
            throw answerError; // Throw để catch ở outer try-catch
          }
        }

        successCount++;
        console.log(
          `Successfully created question ${questionId} with ${questionData.answers.length} answers`
        );
      } catch (error) {
        failedCount++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        errors.push({
          question: questionData.question,
          error: errorMessage,
        });
        console.error("Error creating question:", questionData.question, error);
      }
    }

    console.log(
      `Upload completed: ${successCount} success, ${failedCount} failed`
    );

    return {
      success: successCount,
      failed: failedCount,
      errors,
    };
  },
};
