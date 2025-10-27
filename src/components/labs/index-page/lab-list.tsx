import { FC } from "react";
import { Lab } from "@/types/lab";

import { Loader2 } from "lucide-react";
import { LabCard } from "./lab-card";

interface LabListProps {
  labs: Lab[];
  loading?: boolean;
  onDelete?: (lab: Lab) => void;
  onToggleStatus?: (lab: Lab) => void;
  onView?: (lab: Lab) => void;
}

export const LabList: FC<LabListProps> = ({
  labs,
  loading,
  onDelete,
  onToggleStatus,
  onView,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!labs || labs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">Không có lab nào</h3>
        <p className="mt-1 text-sm text-gray-500">
          Bắt đầu bằng cách tạo lab mới
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {labs.map((lab) => (
        <LabCard
          key={lab.id}
          lab={lab}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onView={onView}
        />
      ))}
    </div>
  );
};
