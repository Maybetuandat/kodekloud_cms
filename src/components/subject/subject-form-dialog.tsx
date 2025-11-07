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

import {
  CreateSubjectRequest,
  Subject,
  UpdateSubjectRequest,
} from "@/types/subject";

// Schema validation
const createSubjectFormSchema = (t: any) =>
  z.object({
    title: z.string().min(1, t("subjects.validation.titleRequired")),
    description: z.string().optional(),
    code: z.string().optional(),
    isActive: z.boolean().default(true),
    credits: z.number().default(0),
  });

interface SubjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject | null;
  onSubmit: (
    data: CreateSubjectRequest | UpdateSubjectRequest
  ) => Promise<void>;
  loading?: boolean;
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  subject,
  onSubmit,
  loading = false,
}: SubjectFormDialogProps) {
  const { t } = useTranslation("subjects");
  const isEditMode = !!subject;

  const form = useForm<CreateSubjectRequest | UpdateSubjectRequest>({
    resolver: zodResolver(createSubjectFormSchema(t)),
    defaultValues: {
      title: "",
      code: "",
      description: "",
      credits: 0,
    },
  });

  useEffect(() => {
    if (subject && open) {
      form.reset({
        title: subject.title,
        description: subject.description || "",
        code: subject.code || "",
        credits: subject.credits,
      });
    } else if (!open) {
      form.reset({
        title: "",
        description: "",
        code: "",
        credits: 0,
      });
    }
  }, [subject, open, form]);

  const handleSubmit = async (
    data: CreateSubjectRequest | UpdateSubjectRequest
  ) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t("subjects.editSubject")
              : t("subjects.createSubject")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("subjects.editSubjectDescription")
              : t("subjects.createSubjectDescription")}
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
                  <FormLabel>{t("subjects.form.title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("subjects.form.titlePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tín chỉ</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Nhập số tín chỉ môn học"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("subjects.form.code")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("subjects.form.codePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("subjects.form.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("subjects.form.descriptionPlaceholder")}
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
