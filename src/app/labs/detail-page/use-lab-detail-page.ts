import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Lab, UpdateLabRequest } from "@/types/lab";
import { labService } from "@/services/labService";

export const useLabDetailPage = (labId: number) => {
  const [lab, setLab] = useState<Lab | null>(null);
  const [isLoadingLab, setIsLoadingLab] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch lab detail
  const fetchLabDetail = useCallback(async () => {
    if (!labId) return;

    try {
      setIsLoadingLab(true);
      const labData = await labService.getLabById(labId);
      setLab(labData);
    } catch (error) {
      console.error("Failed to fetch lab detail:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin lab");
      throw error;
    } finally {
      setIsLoadingLab(false);
    }
  }, [labId]);

  // Fetch lab on mount
  useEffect(() => {
    fetchLabDetail();
  }, [fetchLabDetail]);

  // Update lab
  const updateLab = useCallback(
    async (data: UpdateLabRequest) => {
      if (!labId) return;

      try {
        setActionLoading(true);
        const updatedLab = await labService.updateLab(labId, data);
        setLab(updatedLab);
        return updatedLab;
      } catch (error) {
        console.error("Failed to update lab:", error);
        throw error;
      } finally {
        setTimeout(() => {
          setActionLoading(false);
        }, 200);
      }
    },
    [labId]
  );

  // Toggle lab status
  const toggleLabStatus = useCallback(async () => {
    if (!labId) return;

    try {
      setActionLoading(true);
      const updatedLab = await labService.toggleLabStatus(labId);
      console.log("Toggled Lab:", updatedLab);
      setLab(updatedLab);
      return updatedLab;
    } catch (error) {
      console.error("Failed to toggle lab status:", error);
      throw error;
    } finally {
      setTimeout(() => {
        setActionLoading(false);
      }, 200);
    }
  }, [labId]);

  // Delete lab
  const deleteLab = useCallback(
    async (onSuccess?: () => void, onError?: (error: any) => void) => {
      if (!labId) return;

      try {
        setActionLoading(true);
        await labService.deleteLab(labId);
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error("Failed to delete lab:", error);
        if (onError) {
          onError(error);
        }
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [labId]
  );

  return {
    lab,
    isLoadingLab,
    actionLoading,
    fetchLabDetail,
    updateLab,
    toggleLabStatus,
    deleteLab,
  };
};
