import { useLabQuestions } from "@/app/labs/use-lab-question";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteQuestionDialog } from "./question/lab-delete-question-dialog";
import { LoadingState } from "./question/lab-loading-state";
import { LabQuestionsFilters } from "./question/lab-question-filter";
import { LabQuestionsHeader } from "./question/lab-question-header";
import { LabQuestionsList } from "./question/lab-question-list";

interface LabQuestionsTabProps {
  labId: number;
}

export function LabQuestionsTab({ labId }: LabQuestionsTabProps) {
  const {
    // State
    searchValue,
    deleteQuestionId,
    loading,
    actionLoading,
    questions,
    currentPage,
    pageSize,

    // Handlers
    handleSearchChange,
    handleFiltersChange,
    handleCreateQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleConfirmDelete,
    handleCancelDelete,
  } = useLabQuestions({ labId });

  const handleSortChange = (value: string) => {
    handleFiltersChange({ sortBy: value as "newest" | "oldest" });
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <LabQuestionsHeader onCreateQuestion={handleCreateQuestion} />

        <CardContent>
          <LabQuestionsFilters
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
          />

          <LabQuestionsList
            questions={questions}
            currentPage={currentPage}
            pageSize={pageSize}
            onCreateQuestion={handleCreateQuestion}
            onEditQuestion={handleEditQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </CardContent>
      </Card>

      <DeleteQuestionDialog
        open={deleteQuestionId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={actionLoading}
      />
    </>
  );
}
