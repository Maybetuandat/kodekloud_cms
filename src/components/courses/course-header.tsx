// src/components/courses/course-header.tsx
import React from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface CourseHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  loading?: boolean;
}

export function CourseHeader({
  title,
  description,
  onBack,
  loading = false,
}: CourseHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("courses");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/courses");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
