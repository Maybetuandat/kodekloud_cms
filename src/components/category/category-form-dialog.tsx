// src/components/categories/category-form-dialog.tsx

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSubmit: (
    data: CreateCategoryRequest | UpdateCategoryRequest
  ) => Promise<void>;
  loading?: boolean;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSubmit,
  loading = false,
}: CategoryFormDialogProps) {
  const isEditMode = !!category;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCategoryRequest>({
    defaultValues: {
      name: "",
      slug: "",
      descriptions: "",
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditMode && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [nameValue, isEditMode, setValue]);

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          slug: category.slug,
          descriptions: category.descriptions || "",
        });
      } else {
        reset({
          name: "",
          slug: "",
          descriptions: "",
        });
      }
    }
  }, [open, category, reset]);

  const handleFormSubmit = async (data: CreateCategoryRequest) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin danh mục"
              : "Tạo một danh mục mới cho hệ thống"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên danh mục <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Nhập tên danh mục"
              {...register("name", {
                required: "Tên danh mục là bắt buộc",
                minLength: {
                  value: 2,
                  message: "Tên danh mục phải có ít nhất 2 ký tự",
                },
              })}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              placeholder="danh-muc-slug"
              {...register("slug", {
                required: "Slug là bắt buộc",
                pattern: {
                  value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  message: "Slug chỉ chứa chữ thường, số và dấu gạch ngang",
                },
              })}
              disabled={loading}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {isEditMode
                ? "Slug được tạo tự động từ tên danh mục"
                : "Slug sẽ được tạo tự động từ tên, bạn có thể chỉnh sửa"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descriptions">Mô tả</Label>
            <Textarea
              id="descriptions"
              placeholder="Nhập mô tả cho danh mục"
              rows={4}
              {...register("descriptions")}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
