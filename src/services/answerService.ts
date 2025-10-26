import { api } from "@/lib/api";
import { Answer, CreateAnswerRequest } from "@/types/answer";

const QUESTIONS_ENDPOINT = "/questions";

export const answerService = {
  // Get all answers for a question
  getAnswersByQuestionId: async (questionId: number): Promise<Answer[]> => {
    return api.get<Answer[]>(`${QUESTIONS_ENDPOINT}/${questionId}/answers`);
  },

  // Create answer for a question
  createAnswer: async (
    questionId: number,
    data: CreateAnswerRequest
  ): Promise<Answer> => {
    return api.post<Answer>(
      `${QUESTIONS_ENDPOINT}/${questionId}/answers`,
      data
    );
  },

  // Update answer (nếu có endpoint)
  updateAnswer: async (
    questionId: number,
    answerId: number,
    data: Partial<CreateAnswerRequest>
  ): Promise<Answer> => {
    return api.put<Answer>(
      `${QUESTIONS_ENDPOINT}/${questionId}/answers/${answerId}`,
      data
    );
  },

  // Delete answer (nếu có endpoint)
  deleteAnswer: async (questionId: number, answerId: number): Promise<void> => {
    return api.delete<void>(
      `${QUESTIONS_ENDPOINT}/${questionId}/answers/${answerId}`
    );
  },
};
