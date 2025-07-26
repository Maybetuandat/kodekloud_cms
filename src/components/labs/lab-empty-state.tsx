import React from "react";
import { Plus, Search, Boxes } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LabEmptyStateProps {
  hasFilters: boolean;
  onCreateLab: () => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export function LabEmptyState({
  hasFilters,
  onCreateLab,
  onClearFilters,
  loading = false,
}: LabEmptyStateProps) {
  const { t } = useTranslation('common');

  if (hasFilters) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {t('labs.noLabsFound')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            {t('labs.noLabsFoundDescription')}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              disabled={loading}
            >
              {t('labs.clearFilters')}
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
          <Boxes className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-3">
          {t('labs.noLabsYet')}
        </h3>
        <p className="text-muted-foreground mb-8 max-w-md">
          {t('labs.noLabsYetDescription')}
        </p>
        <Button 
          onClick={onCreateLab}
          disabled={loading}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('labs.createFirstLab')}
        </Button>
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('labs.tip')}:</p>
            <p>{t('labs.labsTip')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}