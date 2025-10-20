// src/components/categories/category-table.tsx
import React from "react";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/category";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  loading?: boolean;
}

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  loading = false,
}: CategoryTableProps) {
  const { t, i18n } = useTranslation("categories");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const locale = i18n.language === "vi" ? vi : enUS;
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale,
      });
    } catch {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>{t("categories.table.title") || "Title"}</TableHead>
              <TableHead>{t("categories.table.slug") || "Slug"}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("categories.table.description") || "Description"}
              </TableHead>
              <TableHead className="w-[100px]">
                {t("categories.table.status") || "Status"}
              </TableHead>
              <TableHead className="hidden lg:table-cell w-[150px]">
                {t("categories.table.updatedAt") || "Updated"}
              </TableHead>
              <TableHead className="w-[80px] text-right">
                {t("common.actions") || "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell colSpan={7}>
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>{t("categories.table.title") || "Title"}</TableHead>
              <TableHead>{t("categories.table.slug") || "Slug"}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("categories.table.description") || "Description"}
              </TableHead>
              <TableHead className="w-[100px]">
                {t("categories.table.status") || "Status"}
              </TableHead>
              <TableHead className="hidden lg:table-cell w-[150px]">
                {t("categories.table.updatedAt") || "Updated"}
              </TableHead>
              <TableHead className="w-[80px] text-right">
                {t("common.actions") || "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {t("categories.noCategories") || "No categories found"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>{t("categories.table.title") || "Title"}</TableHead>
            <TableHead>{t("categories.table.slug") || "Slug"}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("categories.table.description") || "Description"}
            </TableHead>

            <TableHead className="hidden lg:table-cell w-[150px]">
              {t("categories.table.updatedAt") || "Updated"}
            </TableHead>
            <TableHead className="w-[80px] text-right">
              {t("common.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{category.title}</TableCell>
              <TableCell>
                {category.slug ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {category.slug}
                  </code>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {category.description ? (
                  <span className="text-sm line-clamp-2">
                    {category.description}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>

              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {formatDate(category.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(category)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("common.edit") || "Edit"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(category)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("common.delete") || "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
