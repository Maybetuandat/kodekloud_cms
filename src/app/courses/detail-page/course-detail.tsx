// app/courses/detail-page/course-detail.tsx
import { CourseDetailHeader } from "@/components/courses/detail/course-detail-header";
import { CourseLabsTab } from "@/app/courses/detail-page/lab-tab/lab-tabs";
import { CourseOverviewTab } from "@/app/courses/detail-page/overview-tab/overview-tab";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Course } from "@/types/course";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useCourseLabs } from "./lab-tab/use-lab-tab";
import { useCourseOverview } from "./overview-tab/user-overview";
import { useCourseUsers } from "./user-tab/use-user-tab";
import CourseUserTab from "./user-tab/user-course-tab";

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useTranslation(["courses", "common"]);
  const courseIdNumber = Number(courseId);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    course,
    isLoading: isLoadingCourse,
    updateDescription,
    updateBasicInfo,
  } = useCourseOverview(courseIdNumber);

  // Labs hook
  const {
    labsInCourse,
    isLoadingLabs,
    availableLabs,
    isLoadingAvailableLabs,
    fetchAvailableLabs,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    addLabsToCourse,
    removeLabFromCourse,
    handlePageChange,
    handlePageSizeChange,
    handleFiltersChange,
    initializeLabs,
  } = useCourseLabs(courseIdNumber);

  // Users hook
  const {
    usersInCourse,
    leaderboard,
    isLoading: isLoadingUsers,
    isLoadingLeaderboard,
    currentPage: usersCurrentPage,
    totalPages: usersTotalPages,
    totalItems: usersTotalItems,
    pageSize: usersPageSize,
    hasNext: usersHasNext,
    hasPrevious: usersHasPrevious,
    initializeUsers,
    refreshUsers,
    handlePageChange: handleUsersPageChange,
    handlePageSizeChange: handleUsersPageSizeChange,
    handleSearchChange: handleUsersSearchChange,
    removeUserFromCourse,
  } = useCourseUsers(courseIdNumber);

  const safeCourse: Course = course || {
    id: 0,
    title: "",
    description: "",
    level: "",
    updatedAt: "",
    shortDescription: "",
    isActive: false,
    labs: [],
    subject: undefined,
    listCourseUser: [],
  };

  // Handle tab change with lazy loading
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Initialize data when tab is activated
    if (value === "labs") {
      initializeLabs();
    } else if (value === "users") {
      initializeUsers();
    }
  };

  // Show loading state for initial course load
  if (isLoadingCourse) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CourseDetailHeader course={safeCourse} onEdit={updateBasicInfo} />

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              {t("courses.detail.tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="labs">
              {t("courses.detail.tabs.labs")}
            </TabsTrigger>
            <TabsTrigger value="users">
              {t("courses.detail.tabs.users")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <CourseOverviewTab
              description={safeCourse.description ?? ""}
              onSaveDescription={updateDescription}
            />
          </TabsContent>

          {/* Labs Tab - Only loads when activated */}
          <TabsContent value="labs" className="mt-6">
            <CourseLabsTab
              labs={labsInCourse}
              courseId={safeCourse.id}
              addLabsToCourse={addLabsToCourse}
              fetchAvailableLabs={fetchAvailableLabs}
              availableLabs={availableLabs}
              isLoadingAvailableLabs={isLoadingAvailableLabs}
              removeLabFromCourse={removeLabFromCourse}
              isLoading={isLoadingLabs}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onFiltersChange={handleFiltersChange}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <CourseUserTab
              isLoading={isLoadingUsers}
              usersInCourse={usersInCourse}
              leaderboard={leaderboard}
              isLoadingLeaderboard={isLoadingLeaderboard}
              currentPage={usersCurrentPage}
              totalPages={usersTotalPages}
              totalItems={usersTotalItems}
              pageSize={usersPageSize}
              hasNext={usersHasNext}
              hasPrevious={usersHasPrevious}
              courseId={courseIdNumber}
              onPageChange={handleUsersPageChange}
              onPageSizeChange={handleUsersPageSizeChange}
              onSearchChange={handleUsersSearchChange}
              onRemoveUser={removeUserFromCourse}
              onRefresh={refreshUsers}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
