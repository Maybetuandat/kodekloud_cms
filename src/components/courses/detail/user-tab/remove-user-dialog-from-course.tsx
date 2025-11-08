import { FC } from "react";
import { User } from "@/types/user";
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
import { useTranslation } from "react-i18next";

interface RemoveUserDialogProps {
  user: User | null;
  isRemoving: boolean;
  onClose: () => void;
  onRemoveUser: (userId: number) => Promise<void>;
  onRefresh: () => void;
  setIsRemoving: (value: boolean) => void;
}

export const RemoveUserDialog: FC<RemoveUserDialogProps> = ({
  user,
  isRemoving,
  onClose,
  onRemoveUser,
  onRefresh,
  setIsRemoving,
}) => {
  const confirmRemoveUser = async () => {
    if (!user) return;
    setIsRemoving(true);
    try {
      await onRemoveUser(user.id);
      toast.success("Xóa thành công", {
        description: `Đã xóa ${user.lastName} ${user.firstName} khỏi khóa học`,
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
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{"Xóa người dùng khỏi khóa học"}</AlertDialogTitle>
          <AlertDialogDescription>
            {"Bạn có chắc chắn muốn xóa"}{" "}
            <span className="font-semibold">
              {user?.lastName} {user?.firstName}
            </span>{" "}
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
