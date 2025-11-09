import { useLabQuestions } from "@/app/labs/detail-page/use-lab-question";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteQuestionDialog } from "./question/delete-question-dialog";
import { EditQuestionDialog } from "./question/edit-question-dialog";
import { LoadingState } from "./question/loading-state";

import { LabQuestionsHeader } from "./question/question-header";
import { LabQuestionsList } from "./question/question-list";
import { LabUploadExcelDialog } from "./question/upload-question-excel-dialog";
import FilterBar from "@/components/ui/filter-bar";

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
    filters,

    handleSearchChange,
    handleSearchSubmit,
    handleSearchClear,
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

  return (
    <>
      <Card>
        <LabQuestionsHeader
          onUploadExcel={() => setUploadExcelDialogOpen(true)}
        />

        <CardContent>
          <div className="flex flex-col space-y-4">
            <FilterBar
              searchTerm={searchValue}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              onSearchClear={handleSearchClear}
              placeholder="Tìm kiếm câu hỏi, gợi ý hoặc giải pháp..."
              filters={[
                {
                  value: filters.sortBy || "newest",
                  onChange: handleSortChange,
                  placeholder: "Sắp xếp theo",
                  options: [
                    { value: "newest", label: "Mới nhất" },
                    { value: "oldest", label: "Cũ nhất" },
                  ],
                  widthClass: "w-40",
                },
              ]}
            />

            <LabQuestionsList
              questions={questions}
              currentPage={currentPage}
              pageSize={pageSize}
              onUploadExcel={() => setUploadExcelDialogOpen(true)}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </div>
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
