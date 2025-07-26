import React from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

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
import { Lab } from "@/types/lab";


interface LabDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lab: Lab | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function LabDeleteDialog({
  open,
  onOpenChange,
  lab,
  onConfirm,
  loading = false,
}: LabDeleteDialogProps) {
  if (!lab) return null;

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
                Xác nhận xóa lab
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-left space-y-3">
          <p>
            Bạn có chắc chắn muốn xóa lab <strong>"{lab.name}"</strong> không?
          </p>
          
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Base Image:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {lab.baseImage}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Thời gian ước tính:</span>
              <span className="font-medium">{lab.estimatedTime} phút</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trạng thái:</span>
              <Badge variant={lab.isActive ? "default" : "secondary"}>
                {lab.isActive ? "Hoạt động" : "Tạm dừng"}
              </Badge>
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
                  Tất cả dữ liệu liên quan đến lab này sẽ bị xóa vĩnh viễn, 
                  bao gồm các setup steps và execution logs.
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
            Xóa lab
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}