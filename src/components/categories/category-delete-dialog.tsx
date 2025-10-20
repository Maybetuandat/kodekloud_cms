// src/components/categories/category-delete-dialog.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

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
import { Category } from "@/types/category";

interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  loading = false,
}: CategoryDeleteDialogProps) {
  const { t } = useTranslation("categories");

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("categories.deleteConfirmTitle") || "Delete Category"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("categories.deleteConfirmDescription", {
              name: category?.title,
            }) ||
              `Are you sure you want to delete "${category?.title}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("common.cancel") || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("common.delete") || "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
