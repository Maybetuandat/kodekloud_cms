import React from "react";
import { Clock, Settings, Trash2, Power, PowerOff, Info, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lab } from "@/types/lab";

interface LabCardProps {
  lab: Lab;
  onEdit: (lab: Lab) => void;
  onDelete: (lab: Lab) => void;
  onToggleStatus: (lab: Lab) => void;
  loading?: boolean;
}

export function LabCard({
  lab,
  onEdit,
  onDelete,
  onToggleStatus,
  loading = false,
}: LabCardProps) {
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

  const handleViewDetails = () => {
    navigate(`/labs/${lab.id}`);
  };

  return (
    <TooltipProvider>
      <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary cursor-pointer">
        <CardHeader className="pb-3" onClick={handleViewDetails}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {lab.name}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {t('labs.created')} {formatCreatedAt(lab.createdAt)}
                </span>
                <Badge 
                  variant={lab.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {lab.isActive ? t('labs.active') : t('labs.inactive')}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {lab.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {lab.description}
            </p>
          )}

          {/* Lab specs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{lab.estimatedTime} {t('labs.minutes')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Settings className="h-3 w-3" />
              <span className="font-mono truncate">{lab.baseImage}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="gap-1 text-xs"
          >
            <Info className="h-3 w-3" />
            {t('labs.details')}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={loading}>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(lab)}>
                <Settings className="mr-2 h-4 w-4" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(lab)}>
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
                onClick={() => onDelete(lab)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}