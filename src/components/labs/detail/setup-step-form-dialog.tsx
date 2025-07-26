import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Terminal } from "lucide-react";

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
import { SetupStep, CreateSetupStepRequest, UpdateSetupStepRequest } from "@/types/setupStep";

const setupStepFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  setupCommand: z.string().min(1, "Setup command không được để trống"),
  expectedExitCode: z.number().min(0).max(255, "Mã thoát phải từ 0-255"),
  retryCount: z.number().min(1, "Số lần thử lại phải ít nhất 1").max(10, "Số lần thử lại không được vượt quá 10"),
  timeoutSeconds: z.number().min(1, "Timeout phải ít nhất 1 giây").max(3600, "Timeout không được vượt quá 3600 giây"),
  continueOnFailure: z.boolean(),
});

type SetupStepFormData = z.infer<typeof setupStepFormSchema>;

interface SetupStepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setupStep?: SetupStep | null;
  onSubmit: (data: CreateSetupStepRequest | UpdateSetupStepRequest) => Promise<void>;
  loading?: boolean;
}

export function SetupStepFormDialog({
  open,
  onOpenChange,
  setupStep,
  onSubmit,
  loading = false,
}: SetupStepFormDialogProps) {
  const isEditMode = !!setupStep;

  const form = useForm<SetupStepFormData>({
    resolver: zodResolver(setupStepFormSchema),
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

  // Reset form when dialog opens/closes or setupStep changes
  useEffect(() => {
    if (open && setupStep) {
      form.reset({
        title: setupStep.title,
        description: setupStep.description || "",
        setupCommand: setupStep.setupCommand,
        expectedExitCode: setupStep.expectedExitCode,
        retryCount: setupStep.retryCount,
        timeoutSeconds: setupStep.timeoutSeconds,
        continueOnFailure: setupStep.continueOnFailure,
      });
    } else if (open && !setupStep) {
      form.reset({
        title: "",
        description: "",
        setupCommand: "",
        expectedExitCode: 0,
        retryCount: 1,
        timeoutSeconds: 300,
        continueOnFailure: false,
      });
    }
  }, [open, setupStep, form]);

  const handleSubmit = async (data: SetupStepFormData) => {
    try {
      if (isEditMode && setupStep) {
        await onSubmit({ ...data, id: setupStep.id });
      } else {
        await onSubmit(data);
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Form submission error:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Chỉnh sửa Setup Step" : "Tạo Setup Step mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin setup step."
              : "Thêm một bước thiết lập mới cho lab."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tiêu đề setup step..."
                        {...field}
                        disabled={loading}
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
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về setup step..."
                        rows={3}
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả chi tiết về mục đích của setup step này
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Command */}
            <FormField
              control={form.control}
              name="setupCommand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Setup Command *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="apt-get update && apt-get install -y docker.io"
                      rows={4}
                      className="font-mono text-sm"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Lệnh shell sẽ được thực thi trong container
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Configuration Options */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Cấu hình nâng cao</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expectedExitCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã thoát mong đợi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={loading}
                          min={0}
                          max={255}
                        />
                      </FormControl>
                      <FormDescription>
                        Mã thoát khi command thành công (0-255)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retryCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lần thử lại</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={loading}
                          min={1}
                          max={10}
                        />
                      </FormControl>
                      <FormDescription>
                        Số lần thử lại khi command thất bại (1-10)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeoutSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (giây)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="300"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={loading}
                          min={1}
                          max={3600}
                        />
                      </FormControl>
                      <FormDescription>
                        Thời gian timeout cho command (1-3600 giây)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="continueOnFailure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Tiếp tục khi thất bại
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Tiếp tục thực hiện các step tiếp theo khi step này thất bại
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
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}