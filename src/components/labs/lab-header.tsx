import React from "react";
import { Plus, RefreshCw, Boxes } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface LabHeaderProps {
  onCreateLab: () => void;
  onRefresh: () => void;
  loading?: boolean;
  totalLabs: number;
}

export function LabHeader({ 
  onCreateLab, 
  onRefresh, 
  loading = false,
  totalLabs 
}: LabHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1">
              <Boxes className="h-4 w-4" />
              {t('navigation.home')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {t('labs.labManagement')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('labs.labManagement')}
          </h1>
          <p className="text-muted-foreground">
            {t('labs.labManagementDescription')} {' '}
            
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('labs.refresh')}
          </Button>
          
          <Button
            onClick={onCreateLab}
            disabled={loading}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('labs.createNewLab')}
          </Button>
        </div>
      </div>
    </div>
  );
}