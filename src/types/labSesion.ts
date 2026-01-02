export interface UserLabSession {
  sessionId: number;
  labTitle: string;
  status: string;
  startedAt: string;
  completedAt: string;
}

export interface LabHistoryResponse {
  data: UserLabSession[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SubmissionDetail {
  questionId: number;
  questionContent: string;
  userAnswerContent: string;
  correct: boolean;
  submittedAt: string;
}

export interface LabSessionStatistic {
  sessionId: number;
  labTitle: string;
  status: string;
  totalQuestions: number;
  correctAnswers: number;
  submissions: SubmissionDetail[];
}

export interface GetLabHistoryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  userId?: number;
}

export type LabSessionStatus = "COMPLETED" | "IN_PROGRESS" | "SUBMITTED";
