import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import FilterBar from "@/components/ui/filter-bar";

import { useSubjectPage } from "@/app/subject/use-subject";
import { SubjectDeleteDialog } from "@/components/subject/subject-delete-dialog";
import { SubjectFormDialog } from "@/components/subject/subject-form-dialog";
import { SubjectTable } from "@/components/subject/subject-table";

export default function SubjectPage() {
  const { t } = useTranslation("subjects");

  // All logic is now in the hook
  const {
    // Data
    subjects,
    filteredsubjects,

    // Loading states
    loading,
    actionLoading,

    // Filter states
    filters,
    localSearchTerm,

    // Dialog states
    formDialogOpen,
    deleteDialogOpen,
    editingSubject,
    deletingSubject,

    // CRUD handlers
    handleCreateSubject,
    handleUpdateSubject,
    handleDeleteSubject,

    // Dialog handlers
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    setFormDialogOpen,
    setDeleteDialogOpen,

    // Filter handlers
    handleSearchChange,
    handleSearchClear,
    handleSortChange,
  } = useSubjectPage();

  return (
    <div className="min-h-screen w-full px-6 py-6 space-y-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("subjects.title") || "subjects"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("subjects.description") || "Manage your content subjects"}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t("subjects.createNew") || "Create Subject"}
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={localSearchTerm}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        placeholder={t("subjects.searchPlaceholder") || "Search subjects..."}
        filters={[
          {
            value: filters.sortBy,
            onChange: handleSortChange,
            placeholder: t("subjects.sortBy") || "Sort By",
            widthClass: "w-36",
            options: [
              {
                value: "newest",
                label: t("common.sortNewest") || "Newest First",
              },
              {
                value: "oldest",
                label: t("common.sortOldest") || "Oldest First",
              },
              {
                value: "name",
                label: t("common.sortName") || "Name (A-Z)",
              },
            ],
          },
        ]}
      />

      {/* subjects Table */}
      <SubjectTable
        key={Date.now()}
        subjects={filteredsubjects}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        loading={loading}
      />

      {/* Summary */}
      {!loading && subjects.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {t("subjects.showingResults", {
            count: filteredsubjects.length,
            total: subjects.length,
          }) ||
            `Showing ${filteredsubjects.length} of ${subjects.length} subjects`}
        </div>
      )}

      {/* Form Dialog */}
      <SubjectFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        subject={editingSubject}
        onSubmit={editingSubject ? handleUpdateSubject : handleCreateSubject}
        loading={actionLoading}
      />

      {/* Delete Dialog */}
      <SubjectDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        Subject={deletingSubject}
        onConfirm={handleDeleteSubject}
        loading={actionLoading}
      />
    </div>
  );
}
