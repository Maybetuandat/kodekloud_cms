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

import { CourseCard } from "@/components/courses/index-page/course-card";
import { Course } from "@/types/course";
import { Category } from "@/types/subject";
import { useCoursePage } from "@/app/courses/index-page/use-course-page";
import { Pagination } from "@/components/ui/pagination";
import FilterBar from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";

export default function CoursePage() {
  const { t } = useTranslation("courses");
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
    setFilters,
    setCurrentPage,
    setPageSize,
    refresh,
    fetchCategories,
  } = useCoursePage();

  const [localSearchTerm, setLocalSearchTerm] = useState(filters.search);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories một lần khi component mount
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData.filter((cat) => cat.slug));
    };

    loadCategories();
  }, [fetchCategories]);

  // Sync local search term với filters
  useEffect(() => {
    setLocalSearchTerm(filters.search);
  }, [filters.search]);

  const handleSearchSubmit = () => {
    setFilters({ search: localSearchTerm });
  };

  const handleSearchClear = () => {
    setLocalSearchTerm("");
    setFilters({ search: "" });
  };

  const handleStatusChange = (value: string) => {
    setFilters({
      isActive: value === "all" ? undefined : value === "active",
    });
  };

  const handleCategoryChange = (value: string) => {
    setFilters({
      categorySlug: value === "all" ? undefined : value,
    });
  };

  const handleViewCourse = (course: Course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(t("courses.page.deleteConfirm", { title: course.title })))
      return;

    await deleteCourse(
      course.id,
      () =>
        toast.success(t("courses.page.deleteSuccess", { title: course.title })),
      (error) =>
        toast.error(t("courses.page.deleteError", { error: error.message }))
    );
  };

  const handleToggleStatus = async (course: Course) => {
    await toggleCourseStatus(
      course,
      (updated) =>
        toast.success(
          t(
            updated.isActive
              ? "courses.page.activateSuccess"
              : "courses.page.deactivateSuccess",
            { title: updated.title }
          )
        ),
      (error) =>
        toast.error(
          t("courses.page.toggleStatusError", { error: error.message })
        )
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
            <h1 className="text-2xl font-bold tracking-tight">
              {t("courses.page.title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("courses.page.description")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {t("courses.page.refresh")}
          </Button>
          <Button onClick={() => navigate("/courses/new")} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("courses.page.addCourse")}
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border rounded-lg bg-card">
        <FilterBar
          placeholder={t("courses.page.searchPlaceholder")}
          searchTerm={localSearchTerm}
          onSearchChange={setLocalSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
          filters={[
            // Status Filter
            {
              value:
                filters.isActive === undefined
                  ? "all"
                  : filters.isActive
                  ? "active"
                  : "inactive",
              onChange: handleStatusChange,
              placeholder: t("courses.page.statusFilter"),
              widthClass: "w-[140px]",
              options: [
                {
                  value: "all",
                  label: t("courses.page.statusOptions.all"),
                },
                {
                  value: "active",
                  label: t("courses.page.statusOptions.active"),
                },
                {
                  value: "inactive",
                  label: t("courses.page.statusOptions.inactive"),
                },
              ],
            },
            // Category Filter
            {
              value: filters.categorySlug || "all",
              onChange: handleCategoryChange,
              placeholder: t("courses.page.categoryFilter"),
              widthClass: "w-[180px]",
              options: [
                {
                  value: "all",
                  label: t("courses.page.categoryOptions.all"),
                },
                ...categories.map((category) => ({
                  value: category.slug!,
                  label: category.title,
                })),
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
          <h3 className="text-xl font-semibold mb-2">
            {t("courses.page.noCoursesTitle")}
          </h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            {filters.search
              ? t("courses.page.noCoursesSearchDescription")
              : t("courses.page.noCoursesDescription")}
          </p>
          <Button onClick={() => navigate("/courses/new")}>
            <Plus className="h-4 w-4 mr-2" />
            {t("courses.page.createCourse")}
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
                onDelete={handleDeleteCourse}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalItems}
            pageSize={pageSize}
            loading={loading}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            showInfo={true}
            showPageSizeSelector={true}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </>
      )}
    </div>
  );
}
