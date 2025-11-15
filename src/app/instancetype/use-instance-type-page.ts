import { useState, useCallback, useEffect } from "react";
import { instanceTypeService } from "@/services/instanceTypeService";
import {
  CreateInstanceTypeRequest,
  UpdateInstanceTypeRequest,
  InstanceType,
} from "@/types/instanceType";

interface UseInstanceTypePageState {
  instanceTypes: InstanceType[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

interface UseInstanceTypePageActions {
  loadInstanceTypes: () => Promise<void>;
  createInstanceType: (
    data: CreateInstanceTypeRequest,
    onSuccess?: (instanceType: InstanceType) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  updateInstanceType: (
    id: number,
    data: UpdateInstanceTypeRequest,
    onSuccess?: (instanceType: InstanceType) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  deleteInstanceType: (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  refresh: () => void;
  clearError: () => void;
}

export const useInstanceTypePage = (): UseInstanceTypePageState &
  UseInstanceTypePageActions => {
  const [instanceTypes, setInstanceTypes] = useState<InstanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load instance types from API
   */
  const loadInstanceTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instanceTypeService.getAllInstanceTypes();
      setInstanceTypes(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load instance types";
      setError(errorMessage);
      console.error("Failed to load instance types:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load instance types when component mounts
   */
  useEffect(() => {
    loadInstanceTypes();
  }, [loadInstanceTypes]);

  /**
   * Helper function to perform action and refresh data
   */
  const performActionAndRefresh = async (
    action: () => Promise<any>,
    onSuccessCallback?: (result?: any) => void,
    onErrorCallback?: (error: Error) => void
  ) => {
    setActionLoading(true);
    try {
      const result = await action();
      onSuccessCallback?.(result);
      await loadInstanceTypes();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onErrorCallback?.(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Create new instance type
   */
  const createInstanceType = useCallback(
    async (
      data: CreateInstanceTypeRequest,
      onSuccess?: (instanceType: InstanceType) => void,
      onError?: (error: Error) => void
    ) => {
      await performActionAndRefresh(
        () => instanceTypeService.createInstanceType(data),
        onSuccess,
        onError
      );
    },
    []
  );

  /**
   * Update instance type
   */
  const updateInstanceType = useCallback(
    async (
      id: number,
      data: UpdateInstanceTypeRequest,
      onSuccess?: (instanceType: InstanceType) => void,
      onError?: (error: Error) => void
    ) => {
      await performActionAndRefresh(
        () => instanceTypeService.updateInstanceType(id, data),
        onSuccess,
        onError
      );
    },
    []
  );

  /**
   * Delete instance type
   */
  const deleteInstanceType = useCallback(
    async (
      id: number,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      await performActionAndRefresh(
        () => instanceTypeService.deleteInstanceType(id),
        onSuccess,
        onError
      );
    },
    []
  );

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    loadInstanceTypes();
  }, [loadInstanceTypes]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    instanceTypes,
    loading,
    actionLoading,
    error,
    loadInstanceTypes,
    createInstanceType,
    updateInstanceType,
    deleteInstanceType,
    refresh,
    clearError,
  };
};
