export interface Answer {
  id: number;
  content: string;
  isRightAns: boolean;
  questionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnswerRequest {
  content: string;
  isRightAns: boolean;
}
