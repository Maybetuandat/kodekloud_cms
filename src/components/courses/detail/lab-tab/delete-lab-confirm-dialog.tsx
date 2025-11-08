import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

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
import { Lab } from "@/types/lab";
import { toast } from "sonner";

interface DeleteLabConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lab: Lab | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function DeleteLabConfirmDialog({
  open,
  onOpenChange,
  lab,
  onConfirm,
  loading = false,
}: DeleteLabConfirmDialogProps) {
  if (!lab) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
      toast.success(`Xoá bài thực hành "${lab.title}" thành công.`);
    } catch (error) {
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
                Xoá bài thực hành
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-left space-y-3">
          <p>
            Bạn có chắc chắn là xoá bài thực hành này{" "}
            <strong>"{lab.title}"</strong>?
          </p>

          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Hành động này không thể hoàn tác!
            </p>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xoá bài thực hành
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
