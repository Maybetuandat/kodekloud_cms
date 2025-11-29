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
import { Textarea } from "@/components/ui/textarea";
import {
  InstanceType,
  CreateInstanceTypeRequest,
  UpdateInstanceTypeRequest,
} from "@/types/instanceType";

interface InstanceTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instanceType?: InstanceType | null;
  onSubmit: (
    data: CreateInstanceTypeRequest | UpdateInstanceTypeRequest
  ) => void;
  loading?: boolean;
}

export const InstanceTypeDialog: FC<InstanceTypeDialogProps> = ({
  open,
  onOpenChange,
  instanceType,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!instanceType;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInstanceTypeRequest>({
    defaultValues: {
      name: "",
      cpuCores: 1,
      memoryGb: 1,
      storageGb: 1,
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (instanceType) {
        reset({
          name: instanceType.name,
          cpuCores: instanceType.cpuCores,
          memoryGb: instanceType.memoryGb,
          storageGb: instanceType.storageGb,
          description: instanceType.description || "",
        });
      } else {
        reset({
          name: "",
          cpuCores: 1,
          memoryGb: 1,
          storageGb: 1,
          description: "",
        });
      }
    }
  }, [open, instanceType, reset]);

  const handleFormSubmit = (data: CreateInstanceTypeRequest) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa" : "Tạo"} Loại Instance</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Cập nhật thông tin loại instance bên dưới."
              : "Điền thông tin để tạo một loại instance mới."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., t2.micro, t2.small"
                {...register("name", {
                  required: "Tên là bắt buộc",
                  minLength: {
                    value: 2,
                    message: "Tên phải có ít nhất 2 ký tự",
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* CPU Field */}
            <div className="grid gap-2">
              <Label htmlFor="cpu">
                CPU (cores) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cpu"
                type="number"
                min="1"
                placeholder="e.g., 1, 2, 4"
                {...register("cpuCores", {
                  required: "CPU là bắt buộc",
                  min: {
                    value: 1,
                    message: "CPU phải có ít nhất 1 core",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.cpuCores && (
                <p className="text-sm text-destructive">
                  {errors.cpuCores.message}
                </p>
              )}
            </div>

            {/* Memory Field */}
            <div className="grid gap-2">
              <Label htmlFor="memory">
                Memory (GB) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="memory"
                type="number"
                min="1"
                placeholder="e.g., 1, 2, 4, 8"
                {...register("memoryGb", {
                  required: "Memory là bắt buộc",
                  min: {
                    value: 1,
                    message: "Memory phải có ít nhất 1 GB",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.memoryGb && (
                <p className="text-sm text-destructive">
                  {errors.memoryGb.message}
                </p>
              )}
            </div>

            {/* Memory Field */}
            <div className="grid gap-2">
              <Label htmlFor="storage">
                Storage (GB) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="storage"
                type="number"
                min="1"
                placeholder="e.g., 1, 2, 4, 8"
                {...register("storageGb", {
                  required: "Storage là bắt buộc",
                  min: {
                    value: 1,
                    message: "Storage phải có ít nhất 1 GB",
                  },
                  valueAsNumber: true,
                })}
              />
              {errors.storageGb && (
                <p className="text-sm text-destructive">
                  {errors.storageGb.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả tùy chọn..."
                rows={3}
                {...register("description")}
              />
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
