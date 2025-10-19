// src/components/courses/course-form.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@/types/course";

// Schema validation
const createCourseFormSchema = (t: any) =>
  z.object({
    title: z.string().min(1, t("courses.validation.titleRequired")),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    level: z.string().optional(),
    durationMinutes: z
      .number()
      .min(1, t("courses.validation.durationMin"))
      .max(10000, t("courses.validation.durationMax"))
      .optional(),
    isActive: z.boolean().default(true),
  });

interface CourseFormProps {
  course?: Course | null;
  onSubmit: (data: CreateCourseRequest | UpdateCourseRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const courseLevels = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Expert", label: "Expert" },
];

export function CourseForm({
  course,
  onSubmit,
  onCancel,
  loading = false,
}: CourseFormProps) {
  const { t } = useTranslation("courses");

  const courseFormSchema = createCourseFormSchema(t);
  type CourseFormData = z.infer<typeof courseFormSchema>;

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      shortDescription: course?.shortDescription || "",
      level: course?.level || "",
      durationMinutes: course?.durationMinutes || 60,
      isActive: course?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: CourseFormData) => {
    await onSubmit(data as CreateCourseRequest | UpdateCourseRequest);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">
                {t("courses.form.title")}{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("courses.form.titlePlaceholder")}
                  className="text-base"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Short Description */}
        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">
                {t("courses.form.shortDescription")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("courses.form.shortDescriptionPlaceholder")}
                  className="text-base"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormDescription>
                {t("courses.form.shortDescriptionHint")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">
                {t("courses.form.description")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("courses.form.descriptionPlaceholder")}
                  className="resize-none min-h-[150px] text-base"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormDescription>
                {t("courses.form.descriptionHint")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Level and Duration Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">
                  {t("courses.form.level")}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger className="text-base">
                      <SelectValue
                        placeholder={t("courses.form.levelPlaceholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courseLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>{t("courses.form.levelHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">
                  {t("courses.form.duration")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="60"
                    className="text-base"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  {t("courses.form.durationHint")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Active Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-medium">
                  {t("courses.form.active")}
                </FormLabel>
                <FormDescription>
                  {t("courses.form.activeHint")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={loading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {course ? t("common.update") : t("common.create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
