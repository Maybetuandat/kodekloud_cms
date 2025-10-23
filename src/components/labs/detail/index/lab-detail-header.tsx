import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { Lab } from "@/types/lab";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface LabDetailHeaderProps {
  lab: Lab;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onBack: () => void;
}

export function LabDetailHeader({
  lab,
  onEdit,
  onDelete,
  onToggleStatus,
  onBack,
}: LabDetailHeaderProps) {
  const { t } = useTranslation("labs");

  return (
    <div className="border-b bg-background">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{lab.title}</h1>
                <Badge variant={lab.isActive ? "default" : "secondary"}>
                  {lab.isActive ? t("active") : t("inactive")}
                </Badge>
              </div>
              {lab.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {lab.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleStatus}
              className="gap-2"
            >
              {lab.isActive ? (
                <>
                  <PowerOff className="h-4 w-4" />
                  {t("deactivate")}
                </>
              ) : (
                <>
                  <Power className="h-4 w-4" />
                  {t("activate")}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              {t("edit")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t("delete")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
