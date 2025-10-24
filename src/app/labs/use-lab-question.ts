import { useState, useCallback, useEffect } from "react";
import { questionService } from "@/services/questionService";
import {
  Question,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from "@/types/question";

export interface QuestionFilters {
  search?: string;
  sortBy?: "newest" | "oldest";
}

export interface UseLabQuestions {
  questions: Question[];
  loading: boolean;
  actionLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  filters: QuestionFilters;
  searchValue: string;
  deleteQuestionId: number | null;
  createQuestion: (
    data: CreateQuestionRequest,
    onSuccess?: (question: Question) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  updateQuestion: (
    id: number,
    data: UpdateQuestionRequest,
    onSuccess?: (question: Question) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  deleteQuestion: (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  bulkDeleteQuestions: (
    ids: number[],
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  setFilters: (newFilters: Partial<QuestionFilters>) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchValue: (value: string) => void;
  setDeleteQuestionId: (id: number | null) => void;
  handleSearchChange: (value: string) => void;
  handleFiltersChange: (newFilters: Partial<QuestionFilters>) => void;
  handleCreateQuestion: () => void;
  handleEditQuestion: (questionId: number) => void;
  handleDeleteQuestion: (questionId: number) => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;
  refresh: () => void;
}

interface UseLabQuestionsProps {
  labId: number;
}

export const useLabQuestions = ({
  labId,
}: UseLabQuestionsProps): UseLabQuestions => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSizeState] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFiltersState] = useState<QuestionFilters>({
    search: "",
    sortBy: "newest",
  });

  const fetchQuestions = useCallback(async () => {
    if (!labId) return;

    setLoading(true);
    try {
      const response = await questionService.getQuestionsByLabId(labId);

      // Client-side filtering and sorting
      let filteredQuestions = response;

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredQuestions = filteredQuestions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchLower) ||
            q.hint.toLowerCase().includes(searchLower) ||
            q.solution.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      filteredQuestions = filteredQuestions.sort((a, b) => {
        if (filters.sortBy === "newest") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      setQuestions(filteredQuestions);
      setTotalItems(filteredQuestions.length);
      setTotalPages(Math.ceil(filteredQuestions.length / pageSize));
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  }, [labId, filters, pageSize]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const performActionAndRefresh = async (
    action: () => Promise<any>,
    onSuccessCallback: (result?: any) => void,
    onErrorCallback?: (error: Error) => void
  ) => {
    setActionLoading(true);
    try {
      const result = await action();
      onSuccessCallback(result);
      await fetchQuestions();
    } catch (error) {
      onErrorCallback?.(error as Error);
    } finally {
      setActionLoading(false);
    }
  };

  const createQuestion = async (
    data: CreateQuestionRequest,
    onSuccess?: (question: Question) => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => questionService.createQuestion(data),
      (newQuestion) => onSuccess?.(newQuestion),
      onError
    );
  };

  const updateQuestion = async (
    id: number,
    data: UpdateQuestionRequest,
    onSuccess?: (question: Question) => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => questionService.updateQuestion(id, data),
      (updatedQuestion) => onSuccess?.(updatedQuestion),
      onError
    );
  };

  const deleteQuestion = async (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => questionService.deleteQuestion(id),
      () => onSuccess?.(),
      onError
    );
  };

  const bulkDeleteQuestions = async (
    ids: number[],
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    await performActionAndRefresh(
      () => questionService.bulkDeleteQuestions(ids),
      () => onSuccess?.(),
      onError
    );
  };

  const setFilters = (newFilterValues: Partial<QuestionFilters>) => {
    setFiltersState((prevFilters) => ({ ...prevFilters, ...newFilterValues }));
    setCurrentPage(0);
  };

  const setPageSize = (newSize: number) => {
    setPageSizeState(newSize);
    setCurrentPage(0);
  };

  // UI Handler functions
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setFilters({ search: value });
  };

  const handleFiltersChange = (newFilters: Partial<QuestionFilters>) => {
    setFilters(newFilters);
  };

  const handleCreateQuestion = () => {
    // TODO: Open create dialog
    console.log("Create question for lab:", labId);
  };

  const handleEditQuestion = (questionId: number) => {
    // TODO: Open edit dialog
    console.log("Edit question:", questionId);
  };

  const handleDeleteQuestion = (questionId: number) => {
    setDeleteQuestionId(questionId);
  };

  const handleConfirmDelete = async () => {
    if (deleteQuestionId) {
      await deleteQuestion(
        deleteQuestionId,
        () => {
          console.log("Question deleted successfully");
          setDeleteQuestionId(null);
        },
        (error) => {
          console.error("Failed to delete question:", error);
        }
      );
    }
  };

  const handleCancelDelete = () => {
    setDeleteQuestionId(null);
  };

  return {
    // State
    questions,
    loading,
    actionLoading,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    filters,
    searchValue,
    deleteQuestionId,

    // CRUD Operations
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkDeleteQuestions,

    // Setters
    setFilters,
    setCurrentPage,
    setPageSize,
    setSearchValue,
    setDeleteQuestionId,

    // UI Handlers
    handleSearchChange,
    handleFiltersChange,
    handleCreateQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleConfirmDelete,
    handleCancelDelete,

    // Utility
    refresh: fetchQuestions,
  };
};
