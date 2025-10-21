"use client";

import { Trash2, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Lab } from "@/types/lab";
interface LabListProps {
  labs: Lab[];
  onDeleteLab: (labId: string) => void;
}

export function LabList({ labs, onDeleteLab }: LabListProps) {
  const difficultyColors: Record<string, string> = {
    "Cơ bản": "bg-green-100 text-green-800",
    "Trung cấp": "bg-yellow-100 text-yellow-800",
    "Nâng cao": "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      {labs.map((lab) => (
        <Card key={lab.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {lab.name}
                </h3>
                <Badge
                  className={
                    difficultyColors["docker"] || "bg-gray-100 text-gray-800"
                  }
                >
                  level
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {lab.description}
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lab.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Tạo: {lab.createdAt}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteLab(lab.id)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
