import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  RefreshCw,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { CourseCard } from "@/components/courses/course-card";
import { Course } from "@/types/course";
import { useCoursePage } from "@/hooks/courses/use-course-page";
import { Pagination } from "@/components/ui/pagination";
import FilterBar from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CoursePage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const {
    courses,
    loading,
    deleteCourse,
    toggleCourseStatus,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    filters,
    handleFiltersChange,
    handlePageChange,
    handlePageSizeChange, // Lấy hàm mới từ hook
    refresh,
  } = useCoursePage();

  // State cục bộ cho thanh tìm kiếm để không gọi API mỗi lần gõ phím
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.search);

  // Đồng bộ state cục bộ nếu filter từ hook thay đổi
  useEffect(() => {
    setLocalSearchTerm(filters.search);
  }, [filters.search]);

  // Các hàm "adapter" để kết nối FilterBar với hook
  const handleSearchSubmit = () => {
    handleFiltersChange({ ...filters, search: localSearchTerm });
  };

  const handleSearchClear = () => {
    setLocalSearchTerm("");
    handleFiltersChange({ ...filters, search: "" });
  };

  const handleStatusChange = (value: string) => {
    handleFiltersChange({
      ...filters,
      isActive: value === "all" ? undefined : value === "active",
    });
  };

  // Các handler khác của trang
  const handleViewCourse = (course: Course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleEditCourse = (course: Course) => {
    navigate(`/courses/${course.id}/edit`);
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete "${course.title}"?`)) return;
    await deleteCourse(
      course.id,
      () => toast.success(`Course "${course.title}" deleted successfully`),
      (error) => toast.error(`Failed to delete course: ${error.message}`)
    );
  };

  const handleToggleStatus = async (course: Course) => {
    await toggleCourseStatus(
      course,
      (updated) =>
        toast.success(
          `Course "${updated.title}" ${
            updated.isActive ? "activated" : "deactivated"
          } successfully`
        ),
      (error) => toast.error(`Failed to update course status: ${error.message}`)
    );
  };

  return (
    <div className="min-h-screen w-full px-6 py-6 space-y-6 mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground text-sm">
              Manage and organize your training courses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalItems > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {totalItems} Total
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={() => navigate("/courses/new")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border rounded-lg bg-card">
        <FilterBar
          placeholder="Search courses by title..."
          searchTerm={localSearchTerm}
          onSearchChange={setLocalSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          filters={[
            {
              value:
                filters.isActive === undefined
                  ? "all"
                  : filters.isActive
                  ? "active"
                  : "inactive",
              onChange: handleStatusChange,
              placeholder: "Status",
              widthClass: "w-[140px]",
              options: [
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
        />
      </div>

      {/* Content */}
      {loading && courses.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            {filters.search
              ? "Try adjusting your search criteria"
              : "Create your first course to get started"}
          </p>
          <Button onClick={() => navigate("/courses/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onView={handleViewCourse}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
              showPageSizeSelector={true}
            />
          )}
        </>
      )}
    </div>
  );
}
