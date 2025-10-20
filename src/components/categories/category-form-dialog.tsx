// src/components/categories/category-form-dialog.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/category";

// Schema validation
const createCategoryFormSchema = (t: any) =>
  z.object({
    title: z.string().min(1, t("categories.validation.titleRequired")),
    description: z.string().optional(),
    slug: z.string().optional(),
    isActive: z.boolean().default(true),
  });

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
  const { t } = useTranslation("categories");
  const isEditMode = !!category;

  const form = useForm<CreateCategoryRequest | UpdateCategoryRequest>({
    resolver: zodResolver(createCategoryFormSchema(t)),
    defaultValues: {
      title: "",
      description: "",
      slug: "",
    },
  });

  useEffect(() => {
    if (category && open) {
      form.reset({
        title: category.title,
        description: category.description || "",
        slug: category.slug || "",
      });
    } else if (!open) {
      form.reset({
        title: "",
        description: "",
        slug: "",
      });
    }
  }, [category, open, form]);

  const handleSubmit = async (
    data: CreateCategoryRequest | UpdateCategoryRequest
  ) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("categories.editCategory")
              : t("categories.createCategory")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("categories.editCategoryDescription")
              : t("categories.createCategoryDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("categories.form.title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("categories.form.titlePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("categories.form.slug")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("categories.form.slugPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("categories.form.slugDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("categories.form.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("categories.form.descriptionPlaceholder")}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? t("common.save") : t("common.create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
