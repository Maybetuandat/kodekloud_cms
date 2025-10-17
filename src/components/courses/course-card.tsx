// src/components/courses/course-card.tsx
import React from "react";
import {
  Clock,
  Calendar,
  PlayCircle,
  Edit,
  Trash2,
  Power,
  Code,
  Database,
  Cloud,
  Terminal,
  Cpu,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Course } from "@/types/course";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

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

  // Random icon based on course id
  const getIcon = (id: number) => {
    const icons = [
      { Icon: Code, gradient: "from-blue-400 to-blue-600" },
      { Icon: Database, gradient: "from-purple-400 to-purple-600" },
      { Icon: Cloud, gradient: "from-cyan-400 to-cyan-600" },
      { Icon: Terminal, gradient: "from-green-400 to-green-600" },
      { Icon: Cpu, gradient: "from-orange-400 to-orange-600" },
      { Icon: Globe, gradient: "from-pink-400 to-pink-600" },
    ];
    return icons[id % icons.length];
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
    if (!dateString) return "Not updated";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Not updated";
    }
  };

  const { Icon: CourseIcon, gradient } = getIcon(course.id);

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
              Edit
            </DropdownMenuItem>
          )}
          {onToggleStatus && (
            <DropdownMenuItem onClick={() => onToggleStatus(course)}>
              <Power className="mr-2 h-4 w-4" />
              {course.isActive ? "Deactivate" : "Activate"}
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
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Icon Section with gradient background */}
      <div className={cn("h-40 bg-gradient-to-br", gradient, "relative")}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <CourseIcon className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Duration Badge */}
        {formatDuration(course.durationMinutes) && (
          <div className="absolute bottom-2 right-2">
            <Badge
              variant="secondary"
              className="bg-black/20 text-white backdrop-blur-sm border-0"
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(course.durationMinutes)}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base line-clamp-2 mb-1">
            {course.title}
          </h3>
          {course.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.shortDescription}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {course.level && (
            <Badge
              variant="outline"
              className={cn("text-xs", getLevelColor(course.level))}
            >
              {course.level}
            </Badge>
          )}
          {!course.isActive && (
            <Badge variant="destructive" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>

        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatDate(course.updatedAt)}</span>
        </div>

        <Button onClick={() => onView?.(course)} className="w-full" size="sm">
          View Course
        </Button>
      </CardContent>
    </Card>
  );
}
