import { FC } from "react";

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
import { toast } from "sonner";

interface RemoveUserDialogProps {
  name: string;
  userId: number;
  isRemoving: boolean;
  onClose: () => void;
  onRemoveUser: (userId: number) => Promise<void>;
  onRefresh: () => void;
  setIsRemoving: (value: boolean) => void;
}

export const RemoveUserDialog: FC<RemoveUserDialogProps> = ({
  name,
  userId,
  isRemoving,
  onClose,
  onRemoveUser,
  onRefresh,
  setIsRemoving,
}) => {
  const confirmRemoveUser = async () => {
    setIsRemoving(true);
    try {
      await onRemoveUser(userId);
      toast.success("Xóa thành công", {
        description: `Đã xóa ${name} khỏi khóa học`,
      });
      onRefresh();
      onClose();
    } catch (error) {
      toast.error("Xóa thất bại", {
        description:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi xóa người dùng khỏi khóa học",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{"Xóa người dùng khỏi khóa học"}</AlertDialogTitle>
          <AlertDialogDescription>
            {"Bạn có chắc chắn muốn xóa"}{" "}
            <span className="font-semibold">{name}</span>{" "}
            {
              "khỏi khóa học này không? Người dùng sẽ không thể truy cập vào khóa học nữa."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>{"Hủy"}</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmRemoveUser}
            disabled={isRemoving}
            className="bg-red-600 hover:bg-red-700"
          >
            {isRemoving ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
