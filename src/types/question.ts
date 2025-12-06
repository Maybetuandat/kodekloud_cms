import { Answer } from "./answer";

export interface Question {
  id: number;
  hint: string;
  question: string;
  solution: string;
  createdAt: string;
  checkCommand: string;
  typeQuestion: number;
  updatedAt: string;
  answers: Answer[];
}

export interface CreateQuestionRequest {
  hint: string;
  question: string;
  solution: string;
  labId?: number;
}

export interface UpdateQuestionRequest {
  hint?: string;
  question?: string;
  solution?: string;
}

export interface QuestionFilters {
  search?: string;
  labId?: number;
  sortBy?: "newest" | "oldest";
  page?: number;
  pageSize?: number;
}

export interface QuestionsPaginatedResponse {
  data: Question[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface UpdateQuestionWithAnswersRequest {
  hint?: string;
  question?: string;
  solution?: string;
  answers?: Array<{
    id?: number;
    content: string;
    isRightAns: boolean;
  }>;
}
