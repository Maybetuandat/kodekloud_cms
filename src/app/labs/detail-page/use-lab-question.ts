import { useState, useCallback, useEffect } from "react";
import { questionService } from "@/services/questionService";
import { Question, UpdateQuestionRequest } from "@/types/question";
import { ExcelQuestionRow } from "@/services/excelService";

export interface QuestionFilters {
  search?: string;
  sortBy?: "newest" | "oldest";
}

export interface UploadResult {
  success: number;
  failed: number;
  errors: Array<{ question: string; error: string }>;
}

export interface UseLabQuestions {
  questions: Question[];
  loading: boolean;
  actionLoading: boolean;
  currentPage: number;
  uploadExcelDialogOpen: boolean;
  uploadResult: UploadResult | null;
  setUploadExcelDialogOpen: (open: boolean) => void;
  handleUploadExcel: (questions: ExcelQuestionRow[]) => Promise<UploadResult>;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  filters: QuestionFilters;
  searchValue: string;
  deleteQuestionId: number | null;
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
  const [uploadExcelDialogOpen, setUploadExcelDialogOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [filters, setFiltersState] = useState<QuestionFilters>({
    search: "",
    sortBy: "newest",
  });

  const handleUploadExcel = async (
    questions: ExcelQuestionRow[]
  ): Promise<UploadResult> => {
    setActionLoading(true);
    setUploadResult(null);

    try {
      const result = await questionService.bulkCreateQuestionsFromExcel(
        labId,
        questions
      );

      setUploadResult(result);

      // Refresh questions list
      await fetchQuestions();

      // Chỉ đóng dialog nếu upload hoàn toàn thành công
      if (result.failed === 0) {
        setTimeout(() => {
          setUploadExcelDialogOpen(false);
          setUploadResult(null);
        }, 1500);
      }

      return result;
    } catch (error) {
      console.error("Failed to upload questions:", error);
      const errorResult: UploadResult = {
        success: 0,
        failed: questions.length,
        errors: [
          {
            question: "All questions",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
      setUploadResult(errorResult);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

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
    uploadExcelDialogOpen,
    uploadResult,

    updateQuestion,
    deleteQuestion,
    bulkDeleteQuestions,

    setFilters,
    setCurrentPage,
    setPageSize,
    setSearchValue,
    setDeleteQuestionId,
    setUploadExcelDialogOpen,

    // UI Handlers
    handleSearchChange,
    handleFiltersChange,

    handleEditQuestion,
    handleDeleteQuestion,
    handleConfirmDelete,
    handleCancelDelete,
    handleUploadExcel,

    // Utility
    refresh: fetchQuestions,
  };
};
