import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

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
import { Subject } from "@/types/subject";

interface SubjectDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  Subject: Subject | null;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function SubjectDeleteDialog({
  open,
  onOpenChange,
  Subject,
  onConfirm,
  loading = false,
}: SubjectDeleteDialogProps) {
  const { t } = useTranslation("subjects");

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("subjects.deleteConfirmTitle") || "Delete Subject"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("subjects.deleteConfirmDescription", {
              name: Subject?.title,
            }) ||
              `Are you sure you want to delete "${Subject?.title}" ? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("common.cancel") || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("common.delete") || "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
