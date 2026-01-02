// src/app/profile/use-profile-page.ts
import { useState, useEffect, useCallback } from "react";
import { userService } from "@/services/userService";
import { labSessionService } from "@/services/labSessionService";
import { User } from "@/types/user";

interface UserLabSession {
  id: number;
  lab: {
    id: number;
    title: string;
    labNumber: number;
  };
  status: string;
  score: number;
  totalTests: number;
  passedTests: number;
  startedAt: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface LabHistoryResponse {
  data: UserLabSession[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const useProfilePage = (userId?: number) => {
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [historyData, setHistoryData] = useState<LabHistoryResponse | null>(
    null
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      const response = await userService.getUserById(userId);
      setProfileData(response);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [userId]);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      setIsLoadingHistory(true);
      const response = await labSessionService.getLabHistory({
        page: currentPage,
        pageSize: pageSize,
        keyword: keyword || undefined,
      });
      setHistoryData(response);
    } catch (error) {
      console.error("Failed to fetch lab history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId, currentPage, pageSize, keyword]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = () => {
    setKeyword(searchInput);
    setCurrentPage(1);
  };

  return {
    profileData,
    isLoadingProfile,
    historyData,
    isLoadingHistory,
    searchInput,
    setSearchInput,
    handleSearch,
    currentPage,
    totalPages: historyData?.totalPages || 0,
    totalItems: historyData?.totalItems || 0,
    pageSize,
    setCurrentPage,
    setPageSize,
  };
};
