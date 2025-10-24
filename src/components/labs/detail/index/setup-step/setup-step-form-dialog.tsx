// components/labs/detail/setup-steps/setup-step-form-dialog.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SetupStep } from "@/types/setupStep";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const setupStepSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  setupCommand: z.string().min(1, "Setup command is required"),
  expectedExitCode: z.number().int().min(0).default(0),
  retryCount: z.number().int().min(1).max(10).default(1),
  timeoutSeconds: z.number().int().min(1).max(3600).default(300),
  continueOnFailure: z.boolean().default(false),
});

type SetupStepFormData = z.infer<typeof setupStepSchema>;

interface SetupStepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SetupStepFormData) => Promise<void>;
  editingStep?: SetupStep | null;
  loading?: boolean;
}

export function SetupStepFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingStep,
  loading = false,
}: SetupStepFormDialogProps) {
  const { t } = useTranslation("labs");
  const isEditing = !!editingStep;

  const form = useForm<SetupStepFormData>({
    resolver: zodResolver(setupStepSchema),
    defaultValues: {
      title: "",
      description: "",
      setupCommand: "",
      expectedExitCode: 0,
      retryCount: 1,
      timeoutSeconds: 300,
      continueOnFailure: false,
    },
  });

  // Reset form when dialog opens/closes or editingStep changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: editingStep?.title || "",
        description: editingStep?.description || "",
        setupCommand: editingStep?.setupCommand || "",
        expectedExitCode: editingStep?.expectedExitCode ?? 0,
        retryCount: editingStep?.retryCount ?? 1,
        timeoutSeconds: editingStep?.timeoutSeconds ?? 300,
        continueOnFailure: editingStep?.continueOnFailure ?? false,
      });
    }
  }, [open, editingStep, form]);

  const handleSubmit = async (data: SetupStepFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("setupSteps.editStep") : t("setupSteps.createStep")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("setupSteps.editStepDescription")
              : t("setupSteps.createStepDescription")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("setupSteps.form.title")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("setupSteps.form.titlePlaceholder")}
                        {...field}
                      />
                    </FormControl>
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
                    <FormLabel>{t("setupSteps.form.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          "setupSteps.form.descriptionPlaceholder"
                        )}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Setup Command */}
              <FormField
                control={form.control}
                name="setupCommand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("setupSteps.form.setupCommand")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          "setupSteps.form.setupCommandPlaceholder"
                        )}
                        rows={5}
                        className="font-mono text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("setupSteps.form.setupCommandDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Execution Configuration Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium">Execution Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expected Exit Code */}
                <FormField
                  control={form.control}
                  name="expectedExitCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("setupSteps.form.expectedExitCode")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t("setupSteps.form.expectedExitCodeDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Retry Count */}
                <FormField
                  control={form.control}
                  name="retryCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("setupSteps.form.retryCount")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t("setupSteps.form.retryCountDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Timeout Seconds */}
                <FormField
                  control={form.control}
                  name="timeoutSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("setupSteps.form.timeoutSeconds")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="3600"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 300)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {t("setupSteps.form.timeoutSecondsDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Continue On Failure */}
                <FormField
                  control={form.control}
                  name="continueOnFailure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {t("setupSteps.form.continueOnFailure")}
                        </FormLabel>
                        <FormDescription>
                          {t("setupSteps.form.continueOnFailureDescription")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
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
                {isEditing ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
