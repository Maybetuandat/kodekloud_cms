import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lab } from "@/types/lab";
import { Edit, Trash2, Power, Eye, Clock, BookOpen } from "lucide-react";

interface LabCardProps {
  lab: Lab;
  onEdit?: (lab: Lab) => void;
  onDelete?: (lab: Lab) => void;
  onToggleStatus?: (lab: Lab) => void;
  onView?: (lab: Lab) => void;
}

export const LabCard: FC<LabCardProps> = ({
  lab,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1">
              {lab.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={lab.isActive ? "default" : "secondary"}>
                {lab.isActive ? "Active" : "Inactive"}
              </Badge>
              {lab.estimatedTime && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{lab.estimatedTime} phút</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {lab.description || "Chưa có mô tả"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>ID: {lab.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(lab)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(lab)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onToggleStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus(lab)}
                className="h-8 w-8 p-0"
              >
                <Power
                  className={`h-4 w-4 ${
                    lab.isActive ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(lab)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
