import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import FilterBar from "@/components/ui/filter-bar";

import { CategoryTable } from "@/components/categories/category-table";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { CategoryDeleteDialog } from "@/components/categories/category-delete-dialog";
import { useCategoryPage } from "@/app/category/use-category";

export default function CategoryPage() {
  const { t } = useTranslation("categories");

  // All logic is now in the hook
  const {
    // Data
    categories,
    filteredCategories,

    // Loading states
    loading,
    actionLoading,

    // Filter states
    filters,
    localSearchTerm,

    // Dialog states
    formDialogOpen,
    deleteDialogOpen,
    editingCategory,
    deletingCategory,

    // CRUD handlers
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,

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
  } = useCategoryPage();

  return (
    <div className="min-h-screen w-full px-6 py-6 space-y-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("categories.title") || "Categories"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("categories.description") || "Manage your content categories"}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t("categories.createNew") || "Create Category"}
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={localSearchTerm}
        onSearchChange={handleSearchChange}
        onSearchClear={handleSearchClear}
        placeholder={
          t("categories.searchPlaceholder") || "Search categories..."
        }
        filters={[
          {
            value: filters.sortBy,
            onChange: handleSortChange,
            placeholder: t("categories.sortBy") || "Sort By",
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

      {/* Categories Table */}
      <CategoryTable
        key={Date.now()}
        categories={filteredCategories}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        loading={loading}
      />

      {/* Summary */}
      {!loading && categories.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {t("categories.showingResults", {
            count: filteredCategories.length,
            total: categories.length,
          }) ||
            `Showing ${filteredCategories.length} of ${categories.length} categories`}
        </div>
      )}

      {/* Form Dialog */}
      <CategoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        category={editingCategory}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        loading={actionLoading}
      />

      {/* Delete Dialog */}
      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={deletingCategory}
        onConfirm={handleDeleteCategory}
        loading={actionLoading}
      />
    </div>
  );
}
