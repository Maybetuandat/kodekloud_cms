import {
  Clock,
  Calendar,
  Edit,
  Trash2,
  Power,
  FolderOpen,
  MoreVertical,
  Code,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Course } from "@/types/course";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { categoryMap } from "@/constants/category-map";

interface CourseCardProps {
  course: Course;
  onView?: (course: Course) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onToggleStatus?: (course: Course) => void;
  className?: string;
}

export function CourseCard({
  course,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  className,
}: CourseCardProps) {
  const { t } = useTranslation(["courses", "common"]);

  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  // Map category to icon and gradient color
  const getCategoryIconAndGradient = (categorySlug?: string) => {
    // Get slug from category or use a default
    const slug = categorySlug?.toLowerCase() || "default";

    // Return category config or default
    return (
      categoryMap[slug as keyof typeof categoryMap] || {
        Icon: Code,
        gradient: "from-gray-400 to-gray-600",
        name: "Programming",
      }
    );
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("courses.card.notUpdated");
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return t("courses.card.notUpdated");
    }
  };

  const { Icon: CourseIcon, gradient } = getCategoryIconAndGradient(
    course.subject?.code
  );

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg",
        className
      )}
    >
      {/* Action Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(course)}>
              <Edit className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>
          )}
          {onToggleStatus && (
            <DropdownMenuItem onClick={() => onToggleStatus(course)}>
              <Power className="mr-2 h-4 w-4" />
              {course.isActive
                ? t("courses.card.deactivate")
                : t("courses.card.activate")}
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(course)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Icon Section with gradient background based on category */}
      <div className={cn("h-40 bg-gradient-to-br", gradient, "relative")}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <CourseIcon className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Duration Badge - Top Left */}
        {formatDuration(course.durationMinutes) && (
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="bg-black/30 text-white backdrop-blur-sm border-0 font-medium"
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(course.durationMinutes)}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        {/* Title & Description */}
        <div>
          <h3 className="font-semibold text-base line-clamp-2 mb-1.5">
            {course.title}
          </h3>
          <div className="h-10">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.shortDescription || "\u00A0"}
            </p>
          </div>
        </div>

        {/* Meta Information - All in one row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Left side: Subject */}
          {course.subject && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-medium truncate">
                {course.subject.title}
              </span>
            </div>
          )}

          {/* Right side: Level & Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {course.level && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-2 py-0.5",
                  getLevelColor(course.level)
                )}
              >
                {t(`courses.levels.${course.level.toLowerCase()}`)}
              </Badge>
            )}
            {!course.isActive && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {t("courses.card.inactive")}
              </Badge>
            )}
          </div>
        </div>

        {/* Updated Date */}
        <div className="flex items-center text-xs text-muted-foreground pt-1 border-t">
          <Calendar className="h-3 w-3 mr-1.5" />
          <span>{formatDate(course.updatedAt)}</span>
        </div>

        {/* View Button */}
        <Button onClick={() => onView?.(course)} className="w-full" size="sm">
          {t("courses.card.viewCourse")}
        </Button>
      </CardContent>
    </Card>
  );
}
