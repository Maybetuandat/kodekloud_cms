export interface Answer {
  id: number;
  content: string;
  isCorrect: boolean;
  questionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnswerRequest {
  content: string;
  isCorrect: boolean;
}
