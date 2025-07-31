import React from "react";
import { Search, Filter, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface LabFilters {
  search: string;
  status: null | true | false;
  sortBy: "newest" | "oldest" | "name" | "estimatedTime";
}

interface LabFilterBarProps {
  filters: LabFilters;
  onFiltersChange: (filters: LabFilters) => void;
  totalCount: number;
  loading?: boolean;
}

export function LabFilterBar({
  filters,
  onFiltersChange,
  totalCount,
  loading = false,
}: LabFilterBarProps) {
  const { t } = useTranslation('common');

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    let statusValue: null | true | false;
    if (value === "all") statusValue = null;
    else if (value === "active") statusValue = true;
    else statusValue = false;
    
    onFiltersChange({ 
      ...filters, 
      status: statusValue
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      sortBy: value as LabFilters["sortBy"] 
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: null,
      sortBy: "newest",
    });
  };

  const hasActiveFilters = filters.search || filters.status !== null || filters.sortBy !== "newest";
  const activeFilterCount = [
    filters.search,
    filters.status !== null,
    filters.sortBy !== "newest",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search and main filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('labs.searchPlaceholder') || "Tìm kiếm labs..."}
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Status filter */}
        <Select 
          value={filters.status === null ? "all" : filters.status ? "active" : "inactive"} 
          onValueChange={handleStatusChange} 
          disabled={loading}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t('labs.statusFilter') || "Trạng thái"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('labs.allStatus') || "Tất cả"}</SelectItem>
            <SelectItem value="active">{t('labs.active') || "Hoạt động"}</SelectItem>
            <SelectItem value="inactive">{t('labs.inactive') || "Không hoạt động"}</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort filter */}
        <Select value={filters.sortBy} onValueChange={handleSortChange} disabled={loading}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t('labs.sortBy') || "Sắp xếp"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('labs.newest') || "Mới nhất"}</SelectItem>
            <SelectItem value="oldest">{t('labs.oldest') || "Cũ nhất"}</SelectItem>
            <SelectItem value="name">{t('labs.nameSort') || "Tên A-Z"}</SelectItem>
            <SelectItem value="estimatedTime">{t('labs.timeSort') || "Thời gian"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count and active filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {totalCount === 0 
              ? (t('labs.noLabs') || "Không có lab nào")
              : `${totalCount} ${totalCount === 1 ? (t('labs.lab') || 'lab') : (t('labs.labs') || 'labs')}`
            }
          </span>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="gap-1">
                {activeFilterCount} {t('labs.activeFilters') || "bộ lọc"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-xs h-7"
              disabled={loading}
            >
              <X className="h-3 w-3" />
              {t('labs.clearFilters') || "Xóa bộ lọc"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}