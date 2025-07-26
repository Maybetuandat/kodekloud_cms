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
  status: "all" | "active" | "inactive";
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
    onFiltersChange({ 
      ...filters, 
      status: value as LabFilters["status"] 
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
      status: "all",
      sortBy: "newest",
    });
  };

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.sortBy !== "newest";
  const activeFilterCount = [
    filters.search,
    filters.status !== "all",
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
            placeholder={t('labs.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Status filter */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t('labs.statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('labs.allStatus')}</SelectItem>
            <SelectItem value="active">{t('labs.active')}</SelectItem>
            <SelectItem value="inactive">{t('labs.inactive')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort filter */}
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t('labs.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('labs.newest')}</SelectItem>
            <SelectItem value="oldest">{t('labs.oldest')}</SelectItem>
            <SelectItem value="name">{t('labs.nameSort')}</SelectItem>
            <SelectItem value="estimatedTime">{t('labs.timeSort')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count and active filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="gap-1">
                {activeFilterCount} {t('labs.activeFilters')}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-xs h-7"
            >
              <X className="h-3 w-3" />
              {t('labs.clearFilters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}