import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Terminal, Clock, RotateCcw, AlertCircle } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { SetupStep, CreateSetupStepRequest, UpdateSetupStepRequest } from "@/types/setupStep";

// Validation schema
const setupStepFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().optional(),
  setupCommand: z.string().min(1, "Lệnh setup là bắt buộc"),
  expectedExitCode: z.number().int().min(0).max(255),
  retryCount: z.number().int().min(1).max(10),
  timeoutSeconds: z.number().int().min(1).max(3600),
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
  const submitInProgressRef = useRef(false);

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

  // Enhanced submit handler
  const handleSubmit = async (data: SetupStepFormData) => {
    if (submitInProgressRef.current) return;
    
    try {
      submitInProgressRef.current = true;
      if (isEditMode && setupStep) {
        await onSubmit({ ...data, id: setupStep.id });
      } else {
        await onSubmit(data);
      }
      
      // Reset form after successful submission
      form.reset();
      
      // Note: onOpenChange will be called by parent component
      
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      submitInProgressRef.current = false;
    }
  };

  // Enhanced open change handler
  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing during submission or when loading
    if (loading || submitInProgressRef.current) {
      return;
    }
    
    if (!newOpen) {
      // Reset form when closing
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
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Prevent closing when loading or submitting
          if (loading || submitInProgressRef.current) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing when loading or submitting
          if (loading || submitInProgressRef.current) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
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
                        placeholder="Ví dụ: Cài đặt Docker"
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
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về bước setup này..."
                        rows={3}
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả ngắn gọn về chức năng của step này.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Command Configuration */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="h-4 w-4" />
                  <h3 className="font-medium">Cấu hình Command</h3>
                </div>

                <FormField
                  control={form.control}
                  name="setupCommand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lệnh Setup *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="sudo apt-get update && sudo apt-get install -y docker.io"
                          rows={4}
                          className="font-mono text-sm"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        Lệnh sẽ được thực thi để setup môi trường lab.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedExitCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Exit Code mong đợi
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min={0}
                          max={255}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        Exit code để xác định lệnh thành công (thường là 0).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Execution Configuration */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4" />
                  <h3 className="font-medium">Cấu hình thực thi</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="retryCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Số lần retry
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            min={1}
                            max={10}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription>
                          Số lần thử lại nếu lệnh thất bại.
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
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Timeout (giây)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="300"
                            min={1}
                            max={3600}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 300)}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription>
                          Thời gian chờ tối đa (1-3600 giây).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="continueOnFailure"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Tiếp tục khi thất bại
                        </FormLabel>
                        <FormDescription>
                          Cho phép các bước tiếp theo chạy ngay cả khi bước này thất bại.
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
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancel}
                disabled={loading || submitInProgressRef.current}
              >
                Hủy bỏ
              </Button>
              <Button 
                type="submit" 
                disabled={loading || submitInProgressRef.current}
              >
                {(loading || submitInProgressRef.current) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Cập nhật" : "Tạo Setup Step"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}