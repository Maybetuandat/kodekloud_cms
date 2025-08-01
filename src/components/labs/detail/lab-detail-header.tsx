import React from "react";
import { ArrowLeft, Edit, Power, PowerOff, Trash2, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      {/* Header actions - 3 column layout */}
      <div className="grid grid-cols-3 items-center gap-4">
        {/* Left: Back button */}
        <div className="flex justify-start">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/labs")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Center: Lab title and info */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{lab.name}</h1>
           
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

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2 justify-end">
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