"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lab } from "@/types/lab";
interface CreateLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newLab: Lab) => void;
}

export function CreateLabModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateLabModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Trung cấp" as const,
    estimatedTime: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //TODO
    console.log("Submitting lab data:", formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo bài thực hành mới</DialogTitle>
          <DialogDescription>
            Thêm một bài thực hành mới cho khóa học này
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Tiêu đề bài thực hành</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả bài thực hành..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Mức độ khó</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value as any })
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cơ bản">Cơ bản</SelectItem>
                  <SelectItem value="Trung cấp">Trung cấp</SelectItem>
                  <SelectItem value="Nâng cao">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Thời gian ước tính</Label>
              <Input
                id="time"
                placeholder="VD: 30 phút"
                value={formData.estimatedTime}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground"
            >
              Tạo bài thực hành
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
