import React from "react";
import { Dock, Clock, Calendar, Settings } from "lucide-react";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lab } from "@/types/lab";

interface LabInfoCardProps {
  lab: Lab;
}

export function LabInfoCard({ lab }: LabInfoCardProps) {
  const { t, i18n } = useTranslation('common');
  
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const locale = i18n.language === 'vi' ? vi : enUS;
      const formatString = i18n.language === 'vi' ? "dd/MM/yyyy 'lúc' HH:mm" : "MM/dd/yyyy 'at' HH:mm";
      return format(date, formatString, { locale });
    } catch {
      return t('labs.unknownDate');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('labs.labInfo')}
        </CardTitle>
        <CardDescription>
          {t('labs.labInfoDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('labs.labId')}
              </label>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {lab.id}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('labs.status')}
              </label>
              <Badge variant={lab.isActive ? "default" : "secondary"}>
                {lab.isActive ? t('labs.active') : t('labs.inactive')}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('labs.labName')}
            </label>
            <p className="text-sm">
              {lab.name}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('labs.description')}
            </label>
            <p className="text-sm">
              {lab.description}
            </p>
          </div>
        </div>

        <Separator />

        {/* Technical Specifications */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Dock className="h-4 w-4" />
            {t('labs.technicalSpecs')}
          </h4>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('labs.baseDockerImage')}
            </label>
            <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
              {lab.baseImage}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('labs.estimatedTime')}
            </label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {lab.estimatedTime} {t('labs.minutes')}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Other Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('labs.otherInfo')}
          </h4>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('labs.createdDate')}
            </label>
            <p className="text-sm">
              {formatDateTime(lab.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}