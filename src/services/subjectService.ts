import { api } from "@/lib/api";
import {
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
} from "@/types/subject";

const ENDPOINT = "/subjects";

export const SubjectService = {
  // Get all subjects
  getAllSubjects: async (): Promise<Subject[]> => {
    return api.get<Subject[]>(`${ENDPOINT}`);
  },

  // Get Subject by ID
  getSubjectById: async (id: number): Promise<Subject> => {
    return api.get<Subject>(`${ENDPOINT}/${id}`);
  },

  // Create new Subject
  createSubject: async (data: CreateSubjectRequest): Promise<Subject> => {
    console.log("create subject", data);
    return api.post<Subject>(`${ENDPOINT}`, data);
  },

  // Update Subject
  updateSubject: async (
    id: number,
    data: UpdateSubjectRequest
  ): Promise<Subject> => {
    return api.put<Subject>(`${ENDPOINT}/${id}`, data);
  },

  // Delete Subject
  deleteSubject: async (id: number): Promise<void> => {
    return api.delete<void>(`${ENDPOINT}/${id}`);
  },
};
