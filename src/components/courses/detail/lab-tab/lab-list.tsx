"use client";

import { Trash2, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Lab } from "@/types/lab";
import { useState } from "react";
import FilterBar from "@/components/ui/filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { useNavigate, useParams } from "react-router-dom";
interface LabListProps {
  labs: Lab[];
  onDeleteLab: (labId: number) => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  // Search/Filter props
  searchTerm?: string;
  onSearchClear?: () => void;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  loading?: boolean;
}

export function LabList({
  labs,
  onDeleteLab,
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  searchTerm = "",
  onSearchChange,
  onSearchSubmit,
  statusFilter = "all",
  onStatusFilterChange,
  onSearchClear,
  loading = false,
}: LabListProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const handleNavigateToLabDetail = (labId: number, courseId: number) => {
    // Navigate to lab detail page
    console.log("Navigating to lab detail:", labId, courseId);
    navigate(`/courses/${courseId}/labs/${labId}`);
  };

  const handleSearchClear = () => {
    if (onSearchClear) {
      onSearchClear();
    }
    setLocalSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const statusOptions = [
    { value: "all", label: "All status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hours ${mins} minutes`;
    }
    return `${mins} minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      {(onSearchChange || onStatusFilterChange) && (
        <FilterBar
          searchTerm={localSearchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={onSearchSubmit}
          onSearchClear={handleSearchClear}
          placeholder="Search labs..."
          filters={
            onStatusFilterChange
              ? [
                  {
                    value: statusFilter,
                    onChange: onStatusFilterChange,
                    placeholder: "Status",
                    options: statusOptions,
                    widthClass: "w-48",
                  },
                ]
              : undefined
          }
        />
      )}

      {/* Labs List */}
      <div className="space-y-4">
        {labs.map((lab) => (
          <Card
            key={lab.id}
            onClick={() => handleNavigateToLabDetail(lab.id, Number(courseId))}
            className="p-6 hover:shadow-lg transition-all duration-200 border-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title and Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-foreground truncate">
                    {lab.name}
                  </h3>
                  <Badge
                    className={`${
                      lab.isActive
                        ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    } px-3 py-1 text-sm font-medium rounded-full transition-all duration-200`}
                  >
                    {lab.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {lab.description || "No description provided."}
                </p>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(lab.estimatedTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Create at: {formatDate(lab.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteLab(lab.id)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 h-10 w-10"
                disabled={loading}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {labs.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {searchTerm ? "No labs found" : "No labs available"}
          </p>
        </Card>
      )}

      {/* Pagination */}
      {onPageChange && totalPages > 0 && (
        <Pagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={(page) => onPageChange(page - 1)}
          onPageSizeChange={onPageSizeChange}
          loading={loading}
          showInfo={true}
          showPageSizeSelector={!!onPageSizeChange}
        />
      )}
    </div>
  );
}
