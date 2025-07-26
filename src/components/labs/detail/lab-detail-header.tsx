import React from "react";
import { ArrowLeft, Edit, Power, PowerOff, Trash2, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lab } from "@/types/lab";

interface LabDetailHeaderProps {
  lab: Lab;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  loading?: boolean;
}

export function LabDetailHeader({
  lab,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false,
}: LabDetailHeaderProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');

  const formatCreatedAt = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const locale = i18n.language === 'vi' ? vi : enUS;
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale 
      });
    } catch {
      return t('labs.unknownDate');
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t('navigation.home')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/labs">{t('labs.labManagement')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {lab.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-3">
          {/* Title and status */}
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/labs")}
              className="shrink-0 mt-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  {lab.name}
                </h1>
                <Badge 
                  variant={lab.isActive ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {lab.isActive ? t('labs.active') : t('labs.inactive')}
                </Badge>
              </div>
              
              {lab.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {lab.description}
                </p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{t('labs.created')} {formatCreatedAt(lab.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lab.estimatedTime} {t('labs.minutes')}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={onEdit}
            disabled={loading}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('common.edit')}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={loading}>
                {t('labs.actions')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleStatus}>
                {lab.isActive ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    {t('labs.deactivate')}
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    {t('labs.activate')}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('labs.deleteLab')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}