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
  handleSearchSubmit: () => void;
  handleSearchClear: () => void;
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

  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [uploadExcelDialogOpen, setUploadExcelDialogOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [filters, setFiltersState] = useState<QuestionFilters>({
    search: "",
    sortBy: "newest",
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const validateQuestionsBeforeUpload = (
    questions: ExcelQuestionRow[]
  ): {
    valid: ExcelQuestionRow[];
    errors: Array<{ question: string; error: string }>;
  } => {
    const valid: ExcelQuestionRow[] = [];
    const errors: Array<{ question: string; error: string }> = [];

    questions.forEach((q, index) => {
      const isInfrastructureCheck = q.typeQuestion === 1;
      const questionLabel = q.question || `Câu hỏi ${index + 1}`;

      if (!q.question || q.question.trim() === "") {
        errors.push({
          question: questionLabel,
          error: "Thiếu nội dung câu hỏi",
        });
        return;
      }

      if (isInfrastructureCheck) {
        // typeQuestion = 1: Kiểm tra hạ tầng - cần checkCommand
        if (!q.checkCommand || q.checkCommand.trim() === "") {
          errors.push({
            question: questionLabel,
            error:
              "Câu hỏi kiểm tra hạ tầng cần có lệnh kiểm tra (CheckCommand)",
          });
          return;
        }
        // Không cần answers, push vào valid với answers rỗng
        valid.push({
          ...q,
          answers: [],
        });
      } else {
        // typeQuestion = 0 hoặc khác: Câu hỏi thường - cần answers
        if (q.answers.length === 0) {
          errors.push({
            question: questionLabel,
            error: "Câu hỏi thường cần có ít nhất 1 câu trả lời",
          });
          return;
        }

        const hasCorrectAnswer = q.answers.some((a) => a.isRightAns);
        if (!hasCorrectAnswer) {
          errors.push({
            question: questionLabel,
            error: "Cần có ít nhất 1 đáp án đúng",
          });
          return;
        }

        valid.push(q);
      }
    });

    return { valid, errors };
  };

  const handleUploadExcel = async (
    questions: ExcelQuestionRow[]
  ): Promise<UploadResult> => {
    setActionLoading(true);
    setUploadResult(null);

    try {
      // Validate trước khi upload
      const { valid, errors: validationErrors } =
        validateQuestionsBeforeUpload(questions);

      console.log(
        "Validated questions:",
        valid.length,
        "valid,",
        validationErrors.length,
        "errors"
      );

      if (valid.length === 0) {
        const result: UploadResult = {
          success: 0,
          failed: validationErrors.length,
          errors: validationErrors,
        };
        setUploadResult(result);
        return result;
      }

      // Upload các câu hỏi hợp lệ
      const result = await questionService.bulkCreateQuestionsFromExcel(
        labId,
        valid
      );

      // Kết hợp kết quả với validation errors
      const finalResult: UploadResult = {
        success:
          typeof result.success === "number" ? result.success : valid.length,
        failed:
          (typeof result.failed === "number" ? result.failed : 0) +
          validationErrors.length,
        errors: [...validationErrors, ...(result.errors || [])],
      };

      setUploadResult(finalResult);
      setRefreshTrigger((prev) => prev + 1);

      if (finalResult.failed === 0) {
        setTimeout(() => {
          setUploadExcelDialogOpen(false);
          setUploadResult(null);
        }, 1500);
      }

      return finalResult;
    } catch (error) {
      console.error("Failed to upload questions:", error);
      const errorResult: UploadResult = {
        success: 0,
        failed: questions.length,
        errors: [
          {
            question: "Tất cả câu hỏi",
            error:
              error instanceof Error ? error.message : "Lỗi không xác định",
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
  }, [labId, appliedSearch, filters.sortBy, pageSize, refreshTrigger]);

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
      setRefreshTrigger((prev) => prev + 1);
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
    setCurrentPage(1);
  };

  const setPageSize = (newSize: number) => {
    setPageSizeState(newSize);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearchSubmit = () => {
    setAppliedSearch(searchValue);
    setFilters({ search: searchValue });
    setCurrentPage(1);
  };

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
      await questionService.updateQuestion(editQuestionId, data);

      setEditQuestionId(null);
      setRefreshTrigger((prev) => prev + 1);
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
    handleSearchSubmit,
    handleSearchClear,
    handleFiltersChange,
    handleEditQuestion,
    handleDeleteQuestion,
    handleConfirmDelete,
    handleCancelDelete,
    handleUploadExcel,
    handleSaveEditQuestion,

    refresh: () => setRefreshTrigger((prev) => prev + 1),
  };
};
