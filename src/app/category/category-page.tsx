import React, { useState } from "react";
import { useCategoryPage } from "./use-category-page";
import { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryFormDialog } from "@/components/category/category-form-dialog";
import { CategoryTable } from "@/components/category/category-table";
import { DeleteConfirmDialog } from "@/components/category/delete-confirm-dialog";
import { useToast } from "@/components/ui/use-toast";
export default function CategoryPage() {
  const { toast } = useToast();
  const {
    categories,
    loading,
    actionLoading,
    filters,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryPage();

  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  /**
   * Handle add new category button click
   */
  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsFormDialogOpen(true);
  };

  /**
   * Handle edit category button click
   */
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormDialogOpen(true);
  };

  /**
   * Handle delete category button click
   */
  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handle form submission (create or update)
   */
  const handleFormSubmit = async (data: any) => {
    if (selectedCategory) {
      // Update existing category
      await updateCategory(
        selectedCategory.id,
        data,
        () => {
          toast({
            title: "Thành công",
            description: "Danh mục đã được cập nhật",
          });
        },
        (error) => {
          toast({
            title: "Lỗi",
            description: error.message || "Không thể cập nhật danh mục",
            variant: "destructive",
          });
        }
      );
    } else {
      // Create new category
      await createCategory(
        data,
        () => {
          toast({
            title: "Thành công",
            description: "Danh mục đã được tạo",
          });
        },
        (error) => {
          toast({
            title: "Lỗi",
            description: error.message || "Không thể tạo danh mục",
            variant: "destructive",
          });
        }
      );
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    await deleteCategory(
      selectedCategory.id,
      () => {
        toast({
          title: "Thành công",
          description: "Danh mục đã được xóa",
        });
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
      },
      (error) => {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể xóa danh mục",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="min-h-screen w-full px-6 py-6 space-y-6 mb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý danh mục</h1>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      {/* Category table */}
      <CategoryTable
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Form Dialog (Create/Edit) */}
      <CategoryFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        category={selectedCategory}
        onSubmit={handleFormSubmit}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={selectedCategory}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
      />
    </div>
  );
}
