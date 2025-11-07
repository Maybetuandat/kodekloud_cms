import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, CreateUserRequest, UpdateUserRequest } from "@/types/user";
import { Loader2 } from "lucide-react";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
  loading: boolean;
}

export const UserFormDialog: FC<UserFormDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSubmit,
  loading,
}) => {
  const isEditMode = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateUserRequest>({
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      isActive: true,
      role: "USER",
    },
  });

  const isActive = watch("isActive");
  const role = watch("role");

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          password: "",
          isActive: user.isActive,
          role: user.role || "USER",
        });
      } else {
        reset({
          username: "",
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          password: "",
          isActive: true,
          role: "USER",
        });
      }
    }
  }, [open, user, reset]);

  const onSubmitForm = (data: CreateUserRequest) => {
    if (isEditMode) {
      // For update, only send changed fields and exclude empty password
      const updateData: UpdateUserRequest = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        isActive: data.isActive,
        role: data.role,
      };
      if (data.password) {
        updateData.password = data.password;
      }
      onSubmit(updateData);
    } else {
      onSubmit(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Sửa người dùng" : "Tạo người dùng mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Cập nhật thông tin người dùng. Để trống mật khẩu để giữ nguyên mật khẩu hiện tại."
              : "Điền thông tin để tạo người dùng mới."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="space-y-4 py-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                Tài khoản <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                placeholder="Nhập tài khoản"
                {...register("username", {
                  required: "Tài khoản là bắt buộc",
                  minLength: {
                    value: 3,
                    message: "Tài khoản phải có ít nhất 3 ký tự",
                  },
                })}
                disabled={loading}
              />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Nhập tên"
                  {...register("firstName", {
                    required: "Tên là bắt buộc",
                  })}
                  disabled={loading}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Họ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Nhập họ"
                  {...register("lastName", {
                    required: "Họ là bắt buộc",
                  })}
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email"
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Địa chỉ email không hợp lệ",
                  },
                })}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Nhập số điện thoại"
                {...register("phoneNumber")}
                disabled={loading}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Mật khẩu{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
                {isEditMode && (
                  <span className="text-sm text-muted-foreground ml-1">
                    (Để trống để giữ nguyên mật khẩu hiện tại)
                  </span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={
                  isEditMode ? "Nhập mật khẩu (tuỳ chọn)" : "Nhập mật khẩu"
                }
                {...register("password", {
                  required: !isEditMode ? "Password is required" : false,
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={role}
                onValueChange={(value) => setValue("role", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Sinh viên</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="MODERATOR">Giáo viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
