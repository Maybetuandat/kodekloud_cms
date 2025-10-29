import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LoadingState() {
  const { t } = useTranslation(["common"]);

  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
