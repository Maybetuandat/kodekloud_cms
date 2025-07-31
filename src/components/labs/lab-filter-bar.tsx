import React, { useState, useEffect } from "react";
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
  status: undefined | true | false;
  sortBy: "newest" | "oldest"  ;
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
  
  // Local state cho search input
  const [searchValue, setSearchValue] = useState(filters.search);

  // Sync local search với filters từ bên ngoài (khi clear filters)
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const handleSearchInputChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearchSubmit = () => {
    onFiltersChange({ ...filters, search: searchValue });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleStatusChange = (value: string) => {
    let statusValue: undefined | true | false;
    if (value === "all") statusValue = undefined;     
    else if (value === "active") statusValue = true;    
    else if (value === "inactive") statusValue = false; 
    else statusValue = undefined; 
    
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
    setSearchValue(""); // Clear local search value
    onFiltersChange({
      search: "",
      status: undefined,
      sortBy: "newest",
    });
  };

  // Helper function to get select value from status
  const getStatusSelectValue = () => {
    if (filters.status === undefined) return "all";     
    if (filters.status === true) return "active";       
    if (filters.status === false) return "inactive";    
    return "all"; 
  };

  const hasActiveFilters = filters.search || filters.status !== undefined || filters.sortBy !== "newest";
  const activeFilterCount = [
    filters.search,
    filters.status !== undefined,
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
            value={searchValue}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="pl-10"
            disabled={loading}
          />
          {/* Optional: Search button */}
          {searchValue !== filters.search && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2"
              onClick={handleSearchSubmit}
              disabled={loading}
            >
              <Search className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Status filter */}
        <Select 
          value={getStatusSelectValue()} 
          onValueChange={handleStatusChange} 
          disabled={loading}
        >
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
        <Select value={filters.sortBy} onValueChange={handleSortChange} disabled={loading}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t('labs.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('labs.newest')}</SelectItem>
            <SelectItem value="oldest">{t('labs.oldest')}</SelectItem>
            
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
                {activeFilterCount} {t('labs.activeFilters')}
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
              {t('labs.clearFilters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}