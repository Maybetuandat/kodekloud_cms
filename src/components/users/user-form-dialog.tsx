import { FC, useEffect, useState } from "react";
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
import { Role } from "@/types/role";
import { roleService } from "@/services/roleService";
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateUserRequest & { roleId?: number }>({
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      isActive: true,
      roleId: undefined,
    },
  });

  const isActive = watch("isActive");
  const roleId = watch("roleId");

  useEffect(() => {
    if (open) {
      setRolesLoading(true);
      roleService
        .getAllRoles()
        .then((data) => {
          setRoles(data);
        })
        .catch((err) => {
          console.error("Failed to load roles:", err);
        })
        .finally(() => {
          setRolesLoading(false);
        });
    }
  }, [open]);

  useEffect(() => {
    if (open && roles.length > 0) {
      if (user) {
        const userRole = roles.find((r) => r.name === user.roleName);
        reset({
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          password: "",
          isActive: user.isActive,
          roleId: userRole?.id,
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
          roleId: roles[0]?.id,
        });
      }
    }
  }, [open, user, roles, reset]);

  const onSubmitForm = (data: CreateUserRequest & { roleId?: number }) => {
    if (isEditMode) {
      const updateData: UpdateUserRequest = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        isActive: data.isActive,
        roleId: data.roleId,
      };
      if (data.password) {
        updateData.password = data.password;
      }
      onSubmit(updateData);
    } else {
      onSubmit({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        isActive: data.isActive,
        roleId: data.roleId,
      });
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
              ? "Cập nhật thông tin người dùng."
              : "Điền thông tin để tạo người dùng mới."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Tên</Label>
              <Input
                id="firstName"
                placeholder="Nhập tên"
                {...register("firstName", { required: "Tên là bắt buộc" })}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Họ</Label>
              <Input
                id="lastName"
                placeholder="Nhập họ"
                {...register("lastName", { required: "Họ là bắt buộc" })}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              placeholder="Nhập tên đăng nhập"
              {...register("username", {
                required: "Tên đăng nhập là bắt buộc",
              })}
              disabled={loading || isEditMode}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              {...register("email", {
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email không hợp lệ",
                },
              })}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Số điện thoại</Label>
            <Input
              id="phoneNumber"
              placeholder="Nhập số điện thoại"
              {...register("phoneNumber")}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {isEditMode ? "Mật khẩu mới" : "Mật khẩu"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={
                  isEditMode ? "Nhập mật khẩu (tuỳ chọn)" : "Nhập mật khẩu"
                }
                {...register("password", {
                  required: !isEditMode ? "Mật khẩu là bắt buộc" : false,
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

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={roleId?.toString()}
                onValueChange={(value) => setValue("roleId", parseInt(value))}
                disabled={loading || rolesLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={rolesLoading ? "Đang tải..." : "Chọn vai trò"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
              disabled={loading}
            />
            <Label htmlFor="isActive">Kích hoạt</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || rolesLoading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
