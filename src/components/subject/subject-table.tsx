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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Subject } from "@/types/subject";

interface SubjectTableProps {
  subjects: Subject[];
  onEdit: (Subject: Subject) => void;
  onDelete: (Subject: Subject) => void;
  loading?: boolean;
}

export function SubjectTable({
  subjects,
  onEdit,
  onDelete,
  loading = false,
}: SubjectTableProps) {
  const { t, i18n } = useTranslation("subjects");

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
              <TableHead>{t("subjects.table.title") || "Title"}</TableHead>
              <TableHead>{t("subjects.table.slug") || "Slug"}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("subjects.table.description") || "Description"}
              </TableHead>
              <TableHead className="w-[100px]">
                {t("subjects.table.status") || "Status"}
              </TableHead>
              <TableHead className="hidden lg:table-cell w-[150px]">
                {t("subjects.table.updatedAt") || "Updated"}
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

  if (subjects.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>{t("subjects.table.title") || "Title"}</TableHead>
              <TableHead>{t("subjects.table.slug") || "Slug"}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t("subjects.table.description") || "Description"}
              </TableHead>
              <TableHead className="w-[100px]">
                {t("subjects.table.status") || "Status"}
              </TableHead>
              <TableHead className="hidden lg:table-cell w-[150px]">
                {t("subjects.table.updatedAt") || "Updated"}
              </TableHead>
              <TableHead className="w-[80px] text-right">
                {t("common.actions") || "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {t("subjects.nosubjects") || "No subjects found"}
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
            <TableHead>{t("subjects.table.title") || "Title"}</TableHead>
            <TableHead>{t("subjects.table.slug") || "Slug"}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("subjects.table.description") || "Description"}
            </TableHead>

            <TableHead className="hidden lg:table-cell w-[150px]">
              {t("subjects.table.updatedAt") || "Updated"}
            </TableHead>
            <TableHead className="w-[80px] text-right">
              {t("common.actions") || "Actions"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((Subject, index) => (
            <TableRow key={Subject.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{Subject.title}</TableCell>
              <TableCell>
                {Subject.code ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {Subject.code}
                  </code>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {Subject.description ? (
                  <span className="text-sm line-clamp-2">
                    {Subject.description}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>

              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {formatDate(Subject.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(Subject)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("common.edit") || "Edit"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(Subject)}
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
