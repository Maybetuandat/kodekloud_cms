import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Lab } from "@/types/lab";

interface DeleteLabDialogProps {
  open: boolean;
  lab?: Lab | null;
  loading?: boolean;
  onConfirm: (lab: Lab) => void;
  onCancel: () => void;
}

export default function DeleteLabDialog({
  open,
  lab,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteLabDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa lab</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa lab{" "}
            <span className="font-semibold">"{lab?.title}"</span>?<br />
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={loading}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(lab!)}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
