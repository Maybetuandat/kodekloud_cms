import { useLabQuestions } from "@/app/labs/detail-page/use-lab-question";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteQuestionDialog } from "./question/delete-question-dialog";
import { EditQuestionDialog } from "./question/edit-question-dialog";
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
    searchValue,
    deleteQuestionId,
    editQuestionId,
    editQuestionData,
    loading,
    actionLoading,
    questions,
    currentPage,
    pageSize,

    handleSearchChange,
    handleFiltersChange,
    handleEditQuestion,
    handleDeleteQuestion,
    handleConfirmDelete,
    handleCancelDelete,
    handleSaveEditQuestion,
    uploadExcelDialogOpen,
    setUploadExcelDialogOpen,
    setEditQuestionId,
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

      {/* Delete Dialog */}
      <DeleteQuestionDialog
        open={deleteQuestionId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={actionLoading}
      />

      {/* Edit Dialog */}
      <EditQuestionDialog
        open={editQuestionId !== null}
        question={editQuestionData}
        loading={actionLoading}
        onClose={() => setEditQuestionId(null)}
        onSave={handleSaveEditQuestion}
      />

      {/* Upload Excel Dialog */}
      <LabUploadExcelDialog
        open={uploadExcelDialogOpen}
        onClose={() => setUploadExcelDialogOpen(false)}
        onUpload={handleUploadExcel}
      />
    </>
  );
}
