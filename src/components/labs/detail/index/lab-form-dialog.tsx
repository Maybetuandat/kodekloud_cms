import { useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Lab, CreateLabRequest, UpdateLabRequest } from "@/types/lab";

import { toast } from "sonner";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types/category";
import BackingImage from "@/types/backingImages";
import { labService } from "@/services/labService";

const createLabFormSchema = (t: any) =>
  z.object({
    title: z.string().min(1, t("labs.validation.nameRequired")),
    description: z.string().optional(),
    estimatedTime: z
      .number()
      .min(1, t("labs.validation.timeMin"))
      .max(600, t("labs.validation.timeMax")),
    categoryId: z.number().min(1, "Vui lòng chọn danh mục"),
    backingImage: z
      .string()
      .min(1, "Vui lòng chọn hệ điều hành cho bài thực hành"),
  });

interface LabFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lab?: Lab | null;
  onSubmit: (
    data: CreateLabRequest | UpdateLabRequest,
    categoryId: number
  ) => Promise<void>;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [backingImages, setBackingImages] = useState<BackingImage[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingBackingImages, setLoadingBackingImages] = useState(false);

  const labFormSchema = createLabFormSchema(t);
  type LabFormData = z.infer<typeof labFormSchema>;

  const form = useForm<LabFormData>({
    resolver: zodResolver(labFormSchema),
    defaultValues: {
      title: "",
      description: "",
      estimatedTime: 60,
      categoryId: undefined,
      backingImage: "",
    },
  });

  // Load categories when dialog opens
  useEffect(() => {
    const loadCategories = async () => {
      if (!open) return;

      try {
        setLoadingCategories(true);
        const response = await categoryService.getAllCategories();
        setCategories(response);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Không thể tải danh sách danh mục");
      } finally {
        setLoadingCategories(false);
      }
    };
    const loadBackingImages = async () => {
      if (!open) return;
      try {
        setLoadingBackingImages(true);
        const response = await labService.getBackingImages();
        setBackingImages(response);
      } catch (error) {
        console.error("Failed to load backing images:", error);
        toast.error("Không thể tải danh sách hệ điều hành cho bài thực hành");
      } finally {
        setLoadingBackingImages(false);
      }
    };

    loadCategories();
    loadBackingImages();
  }, [open]);

  // Reset form when dialog opens/closes or lab changes
  useEffect(() => {
    if (open && lab) {
      form.reset({
        title: lab.title,
        description: lab.description || "",
        estimatedTime: lab.estimatedTime,
        categoryId: lab.category?.id,
        backingImage: lab.backingImage || "",
      });
    } else if (open && !lab) {
      form.reset({
        title: "",
        description: "",
        estimatedTime: 60,
        categoryId: undefined,
        backingImage: "",
      });
    }
  }, [open, lab, form]);

  const handleSubmit = async (data: LabFormData) => {
    if (submitInProgressRef.current) return;

    try {
      submitInProgressRef.current = true;
      const { categoryId, ...labData } = data;
      await onSubmit(labData, categoryId);
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("labs.labTitle")} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("labs.labTitlePlaceholder")}
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={loading || loadingCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingCategories ? "Đang tải..." : "Chọn danh mục"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn danh mục phù hợp cho lab này
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="backingImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hệ điều hành cho môi trường thực hành</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value?.toString()}
                    disabled={loading || loadingBackingImages}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingBackingImages
                              ? "Đang tải..."
                              : "Chọn hệ điều hành"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {backingImages.map((backingImage) => (
                        <SelectItem
                          key={backingImage.name}
                          value={backingImage.name}
                        >
                          {backingImage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn hệ điều hành cho môi trường thực hành
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
                disabled={
                  loading || submitInProgressRef.current || loadingCategories
                }
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
