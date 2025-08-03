import React from "react";
import { Trash2, AlertTriangle, Loader2, Terminal } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { SetupStep } from "@/types/setupStep";

interface SetupStepDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setupStep: SetupStep | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function SetupStepDeleteDialog({
  open,
  onOpenChange,
  setupStep,
  onConfirm,
  loading = false,
}: SetupStepDeleteDialogProps) {
  if (!setupStep) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Delete confirmation error:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Xác nhận xóa setup step
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-left space-y-3">
          <p>
            Bạn có chắc chắn muốn xóa setup step <strong>"{setupStep.title}"</strong> không?
          </p>
          
          <div className="bg-muted/50 p-3 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Thứ tự:</span>
              <Badge variant="outline">Step {setupStep.stepOrder}</Badge>
            </div>
            
            {setupStep.description && (
              <div className="text-sm">
                <span className="text-muted-foreground">Mô tả:</span>
                <p className="mt-1">{setupStep.description}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm">Command:</span>
              <div className="bg-muted rounded p-2 font-mono text-xs">
                <div className="flex items-start gap-2">
                  <Terminal className="h-3 w-3 mt-0.5 shrink-0" />
                  <pre className="whitespace-pre-wrap break-all">
                    {setupStep.setupCommand}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Trash2 className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">
                  Hành động này không thể hoàn tác!
                </p>
                <p className="text-destructive/80">
                  Setup step sẽ bị xóa vĩnh viễn và thứ tự các step khác sẽ được cập nhật lại.
                </p>
              </div>
            </div>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Hủy bỏ
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xóa setup step
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}