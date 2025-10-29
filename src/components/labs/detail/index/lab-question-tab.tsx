import { useLabQuestions } from "@/app/labs/detail-page/use-lab-question";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteQuestionDialog } from "./question/delete-question-dialog";
import { LoadingState } from "./question/loading-state";
import { LabQuestionsFilters } from "./question/question-filter";
import { LabQuestionsHeader } from "./question/question-header";
import { LabQuestionsList } from "./question/question-list";
import { LabUploadExcelDialog } from "./question/upload-question-excel-dialog";

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

    handleEditQuestion,
    handleDeleteQuestion,
    handleConfirmDelete,
    handleCancelDelete,
    uploadExcelDialogOpen,
    setUploadExcelDialogOpen,
    handleUploadExcel,
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
        <LabQuestionsHeader
          onUploadExcel={() => setUploadExcelDialogOpen(true)}
        />

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
            onUploadExcel={() => setUploadExcelDialogOpen(true)}
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
      <LabUploadExcelDialog
        open={uploadExcelDialogOpen}
        onClose={() => setUploadExcelDialogOpen(false)}
        onUpload={handleUploadExcel}
      />
    </>
  );
}
