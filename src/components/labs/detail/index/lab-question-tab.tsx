import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useTranslation } from "react-i18next";
import {
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionFilters } from "../../../../app/labs/use-lab-detail-page";

import { Question } from "@/types/question";

interface LabQuestionsTabProps {
  questions: Question[];
  onCreateQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: number) => void;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
}

export function LabQuestionsTab({
  questions,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onFiltersChange,
}: LabQuestionsTabProps) {
  const { t } = useTranslation(["questions", "common"]);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const handleDeleteClick = (questionId: number) => {
    setDeleteQuestionId(questionId);
  };

  const handleConfirmDelete = () => {
    if (deleteQuestionId !== null) {
      onDeleteQuestion(deleteQuestionId);
      setDeleteQuestionId(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onFiltersChange({ search: value });
  };

  const handleStatusChange = (value: string) => {
    const status =
      value === "all" ? undefined : value === "active" ? true : false;
    onFiltersChange({ status });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ sortBy: value as "newest" | "oldest" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {t("questions.title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("questions.description")}
              </p>
            </div>
            <Button onClick={onCreateQuestion} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("questions.addQuestion")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.searchPlaceholder")}
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select onValueChange={handleStatusChange} defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("common.statusFilter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allStatus")}</SelectItem>
                <SelectItem value="active">{t("common.active")}</SelectItem>
                <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select onValueChange={handleSortChange} defaultValue="newest">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t("common.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("common.newest")}</SelectItem>
                <SelectItem value="oldest">{t("common.oldest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Questions List */}
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <HelpCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t("questions.noQuestions")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {t("questions.noQuestionsDescription")}
              </p>
              <Button onClick={onCreateQuestion} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("questions.createFirstQuestion")}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <Card
                    key={question.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Question Number */}
                        <div className="flex-shrink-0">
                          <Badge
                            variant="outline"
                            className="h-8 w-8 rounded-full flex items-center justify-center"
                          >
                            {currentPage * pageSize + index + 1}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteQuestionId !== null}
        onOpenChange={(open) => !open && setDeleteQuestionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("questions.deleteConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
