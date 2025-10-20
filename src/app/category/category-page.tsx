import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import FilterBar from "@/components/ui/filter-bar";

import { CategoryTable } from "@/components/categories/category-table";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { CategoryDeleteDialog } from "@/components/categories/category-delete-dialog";
import { useCategoryPage } from "@/hooks/categories/use-category-page";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";
import { date } from "zod";

export default function CategoryPage() {
  const { t } = useTranslation("categories");

  // Use the custom hook for category page logic
  const {
    categories,
    loading,
    actionLoading,
    filters,
    createCategory,
    updateCategory,
    deleteCategory,
    handleFiltersChange,
  } = useCategoryPage();

  // Local UI state for dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  // Local state for search input
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.search);

  // Apply filters to categories (Frontend filtering)
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    // Search filter (search in frontend)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (cat) =>
          cat.title.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower) ||
          cat.slug?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [categories, filters]);

  // Handle create category
  const handleCreateCategory = async (data: CreateCategoryRequest) => {
    await createCategory(
      data,
      (newCategory) => {
        toast.success(
          t("categories.createSuccess", { name: newCategory.title })
        );
        setFormDialogOpen(false);
      },
      (error) => {
        toast.error(t("categories.createError"), {
          description: error.message,
        });
      }
    );
  };

  // Handle update category
  const handleUpdateCategory = async (data: UpdateCategoryRequest) => {
    if (!editingCategory) return;

    await updateCategory(
      editingCategory.id,
      data,
      (updatedCategory) => {
        toast.success(
          t("categories.updateSuccess", { name: updatedCategory.title })
        );
        setFormDialogOpen(false);
        setEditingCategory(null);
      },
      (error) => {
        toast.error(t("categories.updateError"), {
          description: error.message,
        });
      }
    );
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    await deleteCategory(
      deletingCategory.id,
      () => {
        toast.success(
          t("categories.deleteSuccess", { name: deletingCategory.title })
        );
        setDeleteDialogOpen(false);
        setDeletingCategory(null);
      },
      (error) => {
        toast.error(t("categories.deleteError"), {
          description: error.message,
        });
      }
    );
  };

  // Open create dialog
  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  // Handle search change (instant search in frontend)
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    handleFiltersChange({
      ...filters,
      search: value,
    });
  };

  // Handle search clear
  const handleSearchClear = () => {
    setLocalSearchTerm("");
    handleFiltersChange({
      ...filters,
      search: "",
    });
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    let status: undefined | true | false = undefined;
    if (value === "active") status = true;
    if (value === "inactive") status = false;

    handleFiltersChange({
      ...filters,
      status,
    });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    handleFiltersChange({
      ...filters,
      sortBy: value as "newest" | "oldest" | "name",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
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
