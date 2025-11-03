export interface Subject {
  id: number;
  title: string;
  description: string;
  code: string;
  is_Active: boolean;
  credits: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectRequest {
  title: string;
  description: string;
  code: string;
  is_Active: boolean;
  credits: number;
}

export interface UpdateSubjectRequest extends CreateSubjectRequest {}
