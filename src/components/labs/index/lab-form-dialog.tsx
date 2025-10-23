import { useEffect, useRef } from "react";
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
import { Lab, CreateLabRequest, UpdateLabRequest } from "@/types/lab";

const createLabFormSchema = (t: any) =>
  z.object({
    name: z.string().min(1, t("labs.validation.nameRequired")),
    description: z.string().optional(),
    estimatedTime: z
      .number()
      .min(1, t("labs.validation.timeMin"))
      .max(600, t("labs.validation.timeMax")),
  });

interface LabFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lab?: Lab | null;
  onSubmit: (data: CreateLabRequest | UpdateLabRequest) => Promise<void>;
  loading?: boolean;
}

export function LabFormDialog({
  open,
  onOpenChange,
  lab,
  onSubmit,
  loading = false,
}: LabFormDialogProps) {
  const { t } = useTranslation("common");
  const isEditMode = !!lab;
  const submitInProgressRef = useRef(false);

  const labFormSchema = createLabFormSchema(t);
  type LabFormData = z.infer<typeof labFormSchema>;

  const form = useForm<LabFormData>({
    resolver: zodResolver(labFormSchema),
    defaultValues: {
      name: "",
      description: "",
      estimatedTime: 60,
    },
  });

  useEffect(() => {
    if (open && lab) {
      form.reset({
        name: lab.name,
        description: lab.description || "",
        estimatedTime: lab.estimatedTime,
      });
    } else if (open && !lab) {
      form.reset({
        name: "",
        description: "",
        estimatedTime: 60,
      });
    }
  }, [open, lab, form]);

  const handleSubmit = async (data: LabFormData) => {
    if (submitInProgressRef.current) return;

    try {
      submitInProgressRef.current = true;
      await onSubmit(data);

      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      submitInProgressRef.current = false;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (loading || submitInProgressRef.current) {
      return;
    }

    if (!newOpen) {
      form.reset();
    }

    onOpenChange(newOpen);
  };

  const handleCancel = () => {
    if (!loading && !submitInProgressRef.current) {
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          if (loading || submitInProgressRef.current) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (loading || submitInProgressRef.current) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("labs.editLab") : t("labs.createLab")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("labs.editLabDescription")
              : t("labs.createLabDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("labs.labName")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("labs.labNamePlaceholder")}
                      {...field}
                      disabled={loading}
                      autoComplete="off"
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
                  <FormLabel>{t("labs.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("labs.descriptionPlaceholder")}
                      rows={3}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("labs.descriptionHelper")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("labs.estimatedTime")} ({t("labs.minutes")}) *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("labs.estimatedTimeHelper")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading || submitInProgressRef.current}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loading || submitInProgressRef.current}
              >
                {(loading || submitInProgressRef.current) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? t("common.save") : t("labs.createLab")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
