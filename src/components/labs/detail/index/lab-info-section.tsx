import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lab } from "@/types/lab";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, FileText, Hash } from "lucide-react";
import { format } from "date-fns";

interface LabInfoSectionProps {
  lab: Lab;
}

export function LabInfoSection({ lab }: LabInfoSectionProps) {
  const { t } = useTranslation("labs");

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return t("unknownDate");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t("labInfo")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("labInfoDescription")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lab Name - Nổi bật nhất */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">{lab.title}</h3>
          <div className="flex items-center gap-3">
            <Badge variant={lab.isActive ? "default" : "secondary"}>
              {lab.isActive ? t("active") : t("inactive")}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {lab.description && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {t("description")}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed pl-6">
              {lab.description}
            </p>
          </div>
        )}

        {/* Time & Date Info - Grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
          {/* Estimated Time */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("estimatedTime")}
              </p>
              <p className="text-lg font-semibold text-foreground mt-1">
                {lab.estimatedTime}{" "}
                <span className="text-sm font-normal">{t("minutes")}</span>
              </p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("createdDate")}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {lab.createdAt ? formatDate(lab.createdAt) : t("unknownDate")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
