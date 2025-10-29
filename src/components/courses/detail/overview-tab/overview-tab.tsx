import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface CourseOverviewTabProps {
  description: string;
  onSaveDescription: (description: string) => void;
}

export function CourseOverviewTab({
  description,
  onSaveDescription,
}: CourseOverviewTabProps) {
  const { t } = useTranslation(["courses", "common"]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  const handleEditDescription = () => {
    setEditedDescription(description || "");
    setIsEditingDescription(true);
  };

  const handleSaveDescription = () => {
    onSaveDescription(editedDescription);
    setIsEditingDescription(false);
  };

  const handleCancelEdit = () => {
    setIsEditingDescription(false);
    setEditedDescription("");
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {t("courses.detail.overview.detailTitle")}
        </h2>

        {!isEditingDescription ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditDescription}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {t("common.edit")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {t("common.cancel")}
            </Button>
            <Button size="sm" onClick={handleSaveDescription} className="gap-2">
              <Save className="h-4 w-4" />
              {t("common.save")}
            </Button>
          </div>
        )}
      </div>

      {!isEditingDescription ? (
        <div
          className="prose max-w-none dark:prose-invert text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: description as string,
          }}
        />
      ) : (
        <div className="min-h-[300px]">
          <TiptapEditor
            value={editedDescription}
            onChange={setEditedDescription}
            placeholder={
              t("courses.form.descriptionPlaceholder") ||
              "Write course description..."
            }
            className="min-h-[400px]"
          />
        </div>
      )}
    </Card>
  );
}
