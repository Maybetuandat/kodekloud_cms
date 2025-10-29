import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

interface LabQuestionsFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function LabQuestionsFilters({
  searchValue,
  onSearchChange,
  onSortChange,
}: LabQuestionsFiltersProps) {
  const { t } = useTranslation("labs");

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("common.searchPlaceholder")}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sort */}
      <Select onValueChange={onSortChange} defaultValue="newest">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={t("common.sortBy")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t("common.newest")}</SelectItem>
          <SelectItem value="oldest">{t("common.oldest")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
