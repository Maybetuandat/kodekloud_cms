import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Lab } from "@/types/lab";
import { Search, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface SelectLabsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addLabsToCourse: (labIds: number[]) => Promise<void>;
  availableLabs: Lab[];
  loading?: boolean;
  isSubmitting?: boolean;
}

export function SelectLabsDialog({
  open,
  onOpenChange,
  addLabsToCourse,
  availableLabs,
  loading = false,
  isSubmitting = false,
}: SelectLabsDialogProps) {
  const { t } = useTranslation(["courses", "common"]);
  const [selectedLabIds, setSelectedLabIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!open) {
      setSelectedLabIds([]);
      setSearchTerm("");
    }
  }, [open]);

  const filteredLabs = availableLabs.filter((lab) =>
    lab.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleLab = (labId: number) => {
    setSelectedLabIds((prev) =>
      prev.includes(labId)
        ? prev.filter((id) => id !== labId)
        : [...prev, labId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLabIds.length === filteredLabs.length) {
      setSelectedLabIds([]);
    } else {
      setSelectedLabIds(filteredLabs.map((lab) => lab.id));
    }
  };

  const handleConfirm = async () => {
    if (selectedLabIds.length === 0) return;
    await addLabsToCourse(selectedLabIds);
    setSelectedLabIds([]);
    onOpenChange(false);
    toast.success("Thêm bài thực hành vào khóa học thành công.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Chọn Bài thực hành</DialogTitle>
          <DialogDescription>
            Chọn các bài thực hành bạn muốn thêm vào khóa học.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredLabs.length > 0 && (
            <div className="flex items-center space-x-2 pb-2 border-b">
              <Checkbox
                id="select-all"
                checked={
                  selectedLabIds.length === filteredLabs.length &&
                  filteredLabs.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer"
              >
                Chọn tất cả ({filteredLabs.length})
              </label>
            </div>
          )}

          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredLabs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm
                  ? "Không tìm thấy kết quả nào"
                  : "Không có bài thực hành nào khả dụng"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLabs.map((lab) => (
                  <div
                    key={lab.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => toggleLab(lab.id)}
                  >
                    <Checkbox
                      checked={selectedLabIds.includes(lab.id)}
                      onCheckedChange={() => toggleLab(lab.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{lab.title}</div>
                      {lab.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {lab.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{lab.estimatedTime} phút</span>
                        <span>•</span>
                        <span
                          className={
                            lab.isActive
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          {lab.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {selectedLabIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Đã chọn {selectedLabIds.length} Lab
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedLabIds.length === 0 || isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Thêm bài thực hành đã Chọn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
