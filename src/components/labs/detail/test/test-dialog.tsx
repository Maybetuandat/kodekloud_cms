import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TestMessageList } from "./test-message-list";
import { TestStatusBadge } from "./test-status-badge";

import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useLabTest } from "@/app/labs/detail-page/use-lab-test";

interface TestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labId: number;
  labTitle: string;
}

export function TestDialog({
  open,
  onOpenChange,
  labId,
  labTitle,
}: TestDialogProps) {
  const {
    isLoading,
    messages,
    connectionStatus,
    executionStatus,
    startTest,
    stopTest,
    clearMessages,
  } = useLabTest(labId);

  // Start test when dialog opens
  useEffect(() => {
    if (open) {
      clearMessages();
      startTest();
    }
  }, [open, startTest, clearMessages]);

  // Stop test when dialog closes
  const handleClose = () => {
    stopTest();
    onOpenChange(false);
  };

  const canClose =
    executionStatus === "completed" ||
    executionStatus === "failed" ||
    connectionStatus === "error";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-gray-50 border-gray-300">
        <DialogHeader className="border-b border-gray-300 pb-4 bg-gray-100 -mx-6  px-10 pt-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-gray-900">
                Kiểm tra bài thực hành
              </DialogTitle>
              <DialogDescription className="mt-1 text-gray-600">
                Lab: {labTitle}
              </DialogDescription>
            </div>
            <TestStatusBadge
              connectionStatus={connectionStatus}
              executionStatus={executionStatus}
            />
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 border rounded-md bg-slate-800 border-slate-700">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-500" />
                <p className="text-sm text-slate-400">Đang khởi tạo test...</p>
              </div>
            </div>
          ) : (
            <TestMessageList messages={messages} />
          )}
        </div>

        <DialogFooter className="border-t border-gray-300 pt-4 bg-gray-100 -mx-6 -mb-6 px-6 pb-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={!canClose && executionStatus === "running"}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {canClose ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Đóng
              </>
            ) : (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang chạy...
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
