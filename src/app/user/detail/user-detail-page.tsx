import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import { ProfileInfoTab } from "@/components/profile/info-tab/profile-info-tab";
import { useProfilePage } from "./use-profile-page";
import { HistoryTab } from "@/components/users/history-tab/profile-history-tab";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = id ? Number(id) : undefined;
  const [activeTab, setActiveTab] = useState("info");

  const {
    profileData,
    isLoadingProfile,
    historyData,
    isLoadingHistory,
    searchInput,
    setSearchInput,
    handleSearch,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setCurrentPage,
    setPageSize,
  } = useProfilePage(userId);

  const getFullName = () => {
    if (!profileData) return "Họ và tên";
    const fullName = `${profileData.firstName || ""} ${
      profileData.lastName || ""
    }`.trim();
    return fullName || profileData.username || "Họ và tên";
  };

  const getInitials = () => {
    if (!profileData) return "U";
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`.toUpperCase();
    }
    if (profileData.username) {
      return profileData.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-8">
          {/* Section 1: Profile Header */}
          <div className="flex flex-col items-center md:flex-row md:items-end gap-6 pb-6 border-b">
            {isLoadingProfile ? (
              <Skeleton className="h-32 w-32 rounded-full" />
            ) : (
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1 text-center md:text-left space-y-1">
              {isLoadingProfile ? (
                <>
                  <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
                  <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {getFullName()}
                  </h1>
                  <p className="text-muted-foreground">
                    {profileData?.email || "email@example.com"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Tabs Layout */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="history">Lịch sử thực hành</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-0 border-none p-0">
              <ProfileInfoTab
                profileData={profileData}
                isLoading={isLoadingProfile}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0 border-none p-0">
              <HistoryTab
                historyData={historyData}
                isLoading={isLoadingHistory}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                handleSearch={handleSearch}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                setCurrentPage={setCurrentPage}
                setPageSize={setPageSize}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
