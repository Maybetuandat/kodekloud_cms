import React from "react";
import { 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Trash2, 
  GripVertical,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Terminal,
  AlertTriangle
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SetupStep } from "@/types/setupStep";
import { cn } from "@/lib/utils";

interface SetupStepCardProps {
  step: SetupStep;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (step: SetupStep) => void;
  onDelete: (step: SetupStep) => void;
  onMoveUp: (step: SetupStep) => void;
  onMoveDown: (step: SetupStep) => void;
  loading?: boolean;
  className?: string;
}

export function SetupStepCard({
  step,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  loading = false,
  className,
}: SetupStepCardProps) {
  return (
    <TooltipProvider>
      <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            {/* Order number and title */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full shrink-0 mt-0.5">
                <span className="text-sm font-semibold text-primary">
                  {step.stepOrder}
                </span>
              </div>
              
              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-base leading-tight">
                  {step.title}
                </CardTitle>
                {step.description && (
                  <CardDescription className="text-sm">
                    {step.description}
                  </CardDescription>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Move up/down */}
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onMoveUp(step)}
                  disabled={isFirst || loading}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onMoveDown(step)}
                  disabled={isLast || loading}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>

              {/* More actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={loading}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(step)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(step)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Command */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Setup Command
            </label>
            <div className="bg-muted rounded-lg p-3 font-mono text-sm relative">
              <Terminal className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
              <pre className="whitespace-pre-wrap break-all pr-6">
                {step.setupCommand}
              </pre>
            </div>
          </div>

          {/* Configuration badges */}
          <div className="flex flex-wrap gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Exit: {step.expectedExitCode}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mã thoát mong đợi</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-xs">
                  <RotateCcw className="h-3 w-3" />
                  Retry: {step.retryCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Số lần thử lại khi thất bại</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {step.timeoutSeconds}s
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Thời gian timeout</p>
              </TooltipContent>
            </Tooltip>

            {step.continueOnFailure && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    Continue on failure
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tiếp tục thực hiện khi step này thất bại</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}