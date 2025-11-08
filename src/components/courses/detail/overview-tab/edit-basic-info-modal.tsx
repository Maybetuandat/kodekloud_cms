import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";

// Schema validation
const basicInfoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().optional(),
  level: z.string().min(1, "Level is required"),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface EditBasicInfoModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onSubmit: (data: BasicInfoFormData) => void;
  course: Course;
}

export function EditBasicInfoModal({
  isOpen,
  onClose,
  onSubmit,
  course,
}: EditBasicInfoModalProps) {
  const { t } = useTranslation(["courses", "common"]);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: course.title,
      shortDescription: course.shortDescription,
      level: course.level,
      durationMinutes: course.durationMinutes,
    },
  });

  // Reset form when course data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: course.title,
        shortDescription: course.shortDescription,
        level: course.level,
        durationMinutes: course.durationMinutes,
      });
    }
  }, [isOpen, course, form]);

  const handleSubmit = (data: BasicInfoFormData) => {
    onSubmit(data);
    onClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("courses.detail.basicInfo.editTitle")}</DialogTitle>
          <DialogDescription>
            {t("courses.detail.basicInfo.editDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("courses.form.title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("courses.form.titlePlaceholder")}
                      {...field}
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
                  <FormLabel>{t("courses.form.shortDescription")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "courses.form.shortDescriptionPlaceholder"
                      )}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Level */}
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("courses.form.level")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("courses.form.levelPlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">
                        {t("courses.levels.beginner")}
                      </SelectItem>
                      <SelectItem value="intermediate">
                        {t("courses.levels.intermediate")}
                      </SelectItem>
                      <SelectItem value="advanced">
                        {t("courses.levels.advanced")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("courses.form.duration")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.save")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
