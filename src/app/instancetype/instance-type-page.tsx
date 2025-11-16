import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useInstanceTypePage } from "./use-instance-type-page";
import { InstanceTypeTable } from "@/components/instance-type/instance-type-table";
import { InstanceTypeDialog } from "@/components/instance-type/instance-type-dialog";

import {
  InstanceType,
  CreateInstanceTypeRequest,
  UpdateInstanceTypeRequest,
} from "@/types/instanceType";
import { DeleteConfirmDialog } from "@/components/instance-type/ delete-confirm-dialog";

export default function InstanceTypePage() {
  const {
    instanceTypes,
    loading,
    actionLoading,
    createInstanceType,
    updateInstanceType,
    deleteInstanceType,
  } = useInstanceTypePage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInstanceType, setSelectedInstanceType] =
    useState<InstanceType | null>(null);

  const handleCreate = () => {
    setSelectedInstanceType(null);
    setDialogOpen(true);
  };

  const handleEdit = (instanceType: InstanceType) => {
    setSelectedInstanceType(instanceType);
    setDialogOpen(true);
  };

  const handleDelete = (instanceType: InstanceType) => {
    setSelectedInstanceType(instanceType);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (
    data: CreateInstanceTypeRequest | UpdateInstanceTypeRequest
  ) => {
    if (selectedInstanceType) {
      // Update
      await updateInstanceType(
        selectedInstanceType.id,
        data,
        () => {
          toast.success("Instance type updated successfully");
          setDialogOpen(false);
          setSelectedInstanceType(null);
        },
        (error) => {
          toast.error(`Failed to update: ${error.message}`);
        }
      );
    } else {
      // Create
      await createInstanceType(
        data as CreateInstanceTypeRequest,
        () => {
          toast.success("Tạo instance type thành công");
          setDialogOpen(false);
        },
        (error) => {
          toast.error(`Failed to create: ${error.message}`);
        }
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstanceType) return;

    await deleteInstanceType(
      selectedInstanceType.id,
      () => {
        toast.success("Xóa loại instance thành công");
        setDeleteDialogOpen(false);
        setSelectedInstanceType(null);
      },
      (error) => {
        toast.error(`Failed to delete: ${error.message}`);
      }
    );
  };

  return (
    <div className="min-h-screen w-full px-6 py-6 space-y-6 mb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instance Types</h1>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo loại instance
        </Button>
      </div>

      {/* Table */}
      <InstanceTypeTable
        instanceTypes={instanceTypes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create/Edit Dialog */}
      <InstanceTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        instanceType={selectedInstanceType}
        onSubmit={handleSubmit}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Xóa loại instance"
        description={`Bạn có chắc chắn muốn xóa loại instance "${selectedInstanceType?.name}" không? Hành động này không thể hoàn tác.`}
        loading={actionLoading}
      />
    </div>
  );
}
