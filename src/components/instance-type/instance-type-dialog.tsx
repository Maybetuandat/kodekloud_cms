import { FC, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BackingImage from "@/types/backingImages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  InstanceType,
  CreateInstanceTypeRequest,
  UpdateInstanceTypeRequest,
} from "@/types/instanceType";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { labService } from "@/services/labService";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

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

  const [backingImages, setBackingImages] = useState<BackingImage[]>([]);
  const methods = useForm<CreateInstanceTypeRequest>({
    defaultValues: {
      name: "",
      cpuCores: 1,
      memoryGb: 1,
      storageGb: 1,
      description: "",
      backingImage: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  const [loadingBackingImages, setLoadingBackingImages] = useState(false);
  const [hasLoadedImages, setHasLoadedImages] = useState(false);

  const loadBackingImages = async () => {
    if (hasLoadedImages) return;
    try {
      setLoadingBackingImages(true);
      const response = await labService.getBackingImages();
      setBackingImages(response);
      setHasLoadedImages(true);
    } catch (error) {
      console.error("Failed to load backing images:", error);
      toast.error("Không thể tải danh sách hệ điều hành cho bài thực hành");
    } finally {
      setLoadingBackingImages(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (instanceType) {
        reset({
          name: instanceType.name,
          cpuCores: instanceType.cpuCores,
          memoryGb: instanceType.memoryGb,
          storageGb: instanceType.storageGb,
          description: instanceType.description || "",
          backingImage: instanceType.backingImage || "",
        });
      } else {
        reset({
          name: "",
          cpuCores: 1,
          memoryGb: 1,
          storageGb: 1,
          description: "",
          backingImage: "",
        });
      }
      setHasLoadedImages(false);
      setBackingImages([]);
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

        <FormProvider {...methods}>
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

              {/* Storage Field */}
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

              {/* Backing Image Field */}
              <FormField
                control={control}
                name="backingImage"
                rules={{ required: "Hệ điều hành là bắt buộc" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hệ điều hành *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                      disabled={loading || loadingBackingImages}
                      onOpenChange={(open) => {
                        if (open) {
                          loadBackingImages();
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingBackingImages
                                ? "Đang tải..."
                                : "Chọn hệ điều hành"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {field.value &&
                          !backingImages.find(
                            (img) => img.name === field.value
                          ) && (
                            <SelectItem value={field.value}>
                              {field.value}
                            </SelectItem>
                          )}
                        {backingImages.map((backingImage) => (
                          <SelectItem
                            key={backingImage.name}
                            value={backingImage.name}
                          >
                            {backingImage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Chọn hệ điều hành cho môi trường thực hành
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
