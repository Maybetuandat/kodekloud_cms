import { useState, useCallback, useEffect } from "react";
import { userService } from "@/services/userService";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
} from "@/types/user";

interface UseUserPageState {
  users: User[];
  loading: boolean;
  actionLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  filters: UserFilters;
  error: string | null;
}

interface UseUserPageActions {
  loadUsers: () => Promise<void>;
  createUser: (
    data: CreateUserRequest,
    onSuccess?: (user: User) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  updateUser: (
    id: number,
    data: UpdateUserRequest,
    onSuccess?: (user: User) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  deleteUser: (
    id: number,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
  setFilters: (newFilters: Partial<UserFilters>) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
  clearError: () => void;
}

const initialFilters: UserFilters = {
  keyword: "",
  isActive: undefined,
};

export const useUserPage = (): UseUserPageState & UseUserPageActions => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFiltersState] = useState<UserFilters>(initialFilters);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load users from API
   */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsersPaginated({
        page: currentPage,
        pageSize: pageSize,
        keyword: filters.keyword || undefined,
        isActive: filters.isActive,
      });

      setUsers(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load users";
      setError(errorMessage);
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  /**
   * Load users when dependencies change
   */
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Helper function to perform action and refresh data
   */
  const performActionAndRefresh = async (
    action: () => Promise<any>,
    onSuccessCallback?: (result?: any) => void,
    onErrorCallback?: (error: Error) => void
  ) => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await action();
      await loadUsers();
      onSuccessCallback?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Action failed");
      setError(error.message);
      onErrorCallback?.(error);
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Create a new user
   */
  const createUser = useCallback(
    async (
      data: CreateUserRequest,
      onSuccess?: (user: User) => void,
      onError?: (error: Error) => void
    ) => {
      await performActionAndRefresh(
        () => userService.createUser(data),
        onSuccess,
        onError
      );
    },
    [loadUsers]
  );

  /**
   * Update an existing user
   */
  const updateUser = useCallback(
    async (
      id: number,
      data: UpdateUserRequest,
      onSuccess?: (user: User) => void,
      onError?: (error: Error) => void
    ) => {
      await performActionAndRefresh(
        () => userService.updateUser(id, data),
        onSuccess,
        onError
      );
    },
    [loadUsers]
  );

  /**
   * Delete a user
   */
  const deleteUser = useCallback(
    async (
      id: number,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      await performActionAndRefresh(
        () => userService.deleteUser(id),
        onSuccess,
        onError
      );
    },
    [loadUsers]
  );

  /**
   * Update filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  /**
   * Set current page
   */
  const setCurrentPageHandler = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Set page size and reset to page 1
   */
  const setPageSizeHandler = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    users,
    loading,
    actionLoading,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    filters,
    error,
    // Actions
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    setFilters,
    setCurrentPage: setCurrentPageHandler,
    setPageSize: setPageSizeHandler,
    refresh,
    clearError,
  };
};
