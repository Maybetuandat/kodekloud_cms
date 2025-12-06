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
  searchValue: string; // Local search value (for input display)
  deleteQuestionId: number | null;
  editQuestionId: number | null;
  editQuestionData: Question | null;
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
  setEditQuestionId: (id: number | null) => void;
  handleSearchChange: (value: string) => void;
  handleSearchSubmit: () => void; // New: Submit search
  handleSearchClear: () => void; // New: Clear search
  handleFiltersChange: (newFilters: Partial<QuestionFilters>) => void;
  handleEditQuestion: (questionId: number) => void;
  handleDeleteQuestion: (questionId: number) => void;
  handleConfirmDelete: () => Promise<void>;
  handleCancelDelete: () => void;
  handleSaveEditQuestion: (data: {
    question: string;
    hint: string;
    solution: string;
    answers: Array<{
      id?: number;
      content: string;
      isRightAns: boolean;
    }>;
  }) => Promise<void>;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [editQuestionId, setEditQuestionId] = useState<number | null>(null);
  const [editQuestionData, setEditQuestionData] = useState<Question | null>(
    null
  );

  // Separate local search value (for input) and applied search (for filtering)
  const [searchValue, setSearchValue] = useState(""); // Local input value
  const [appliedSearch, setAppliedSearch] = useState(""); // Applied to filters

  const [uploadExcelDialogOpen, setUploadExcelDialogOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [filters, setFiltersState] = useState<QuestionFilters>({
    search: "",
    sortBy: "newest",
  });

  // Load question data when editQuestionId changes
  useEffect(() => {
    if (editQuestionId !== null) {
      const question = questions.find((q) => q.id === editQuestionId);
      if (question) {
        setEditQuestionData(question);
      }
    } else {
      setEditQuestionData(null);
    }
  }, [editQuestionId, questions]);

  const handleUploadExcel = async (
    questions: ExcelQuestionRow[]
  ): Promise<UploadResult> => {
    setActionLoading(true);
    setUploadResult(null);

    try {
      console.log("debug question in file hook", questions);
      const result = await questionService.bulkCreateQuestionsFromExcel(
        labId,
        questions
      );

      setUploadResult(result);
      await fetchQuestions();

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

      let filteredQuestions = response;

      // Use appliedSearch instead of filters.search
      if (appliedSearch) {
        const searchLower = appliedSearch.toLowerCase();
        filteredQuestions = filteredQuestions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchLower) ||
            q.hint.toLowerCase().includes(searchLower) ||
            q.solution.toLowerCase().includes(searchLower)
        );
      }

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
  }, [labId, appliedSearch, filters.sortBy, pageSize]);

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

  // Only update local search value (doesn't trigger fetch)
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  // Submit search (triggered by Enter key)
  const handleSearchSubmit = () => {
    setAppliedSearch(searchValue);
    setFilters({ search: searchValue });
    setCurrentPage(1);
  };

  // Clear search
  const handleSearchClear = () => {
    setSearchValue("");
    setAppliedSearch("");
    setFilters({ search: "" });
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: Partial<QuestionFilters>) => {
    setFilters(newFilters);
  };

  const handleEditQuestion = (questionId: number) => {
    setEditQuestionId(questionId);
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

  // Save edited question with answers
  const handleSaveEditQuestion = async (data: {
    question: string;
    hint: string;
    solution: string;
    answers: Array<{
      id?: number;
      content: string;
      isRightAns: boolean;
    }>;
  }) => {
    if (!editQuestionId) return;

    setActionLoading(true);
    try {
      // Call API with complete data including answers
      await questionService.updateQuestion(editQuestionId, data);

      // Refresh questions list
      await fetchQuestions();

      // Close dialog
      setEditQuestionId(null);
    } catch (error) {
      console.error("Failed to save question:", error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  return {
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
    editQuestionId,
    editQuestionData,
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
    setEditQuestionId,
    setUploadExcelDialogOpen,

    handleSearchChange,
    handleSearchSubmit, // New
    handleSearchClear, // New
    handleFiltersChange,
    handleEditQuestion,
    handleDeleteQuestion,
    handleConfirmDelete,
    handleCancelDelete,
    handleUploadExcel,
    handleSaveEditQuestion,

    refresh: fetchQuestions,
  };
};
