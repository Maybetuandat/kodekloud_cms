import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lab, CreateLabRequest, UpdateLabRequest } from "@/types/lab";

// Schema với validation messages từ translation
const createLabFormSchema = (t: any) => z.object({
  name: z.string().min(1, t('labs.validation.nameRequired')),
  description: z.string().optional(),
  baseImage: z.string().min(1, t('labs.validation.baseImageRequired')),
  estimatedTime: z.number()
    .min(1, t('labs.validation.timeMin'))
    .max(600, t('labs.validation.timeMax')),
});

interface LabFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lab?: Lab | null;
  onSubmit: (data: CreateLabRequest | UpdateLabRequest) => Promise<void>;
  loading?: boolean;
}

const baseImages = [
  { value: "ubuntu:20.04", label: "Ubuntu 20.04" },
  { value: "ubuntu:22.04", label: "Ubuntu 22.04" },
  { value: "centos:7", label: "CentOS 7" },
  { value: "centos:8", label: "CentOS 8" },
  { value: "alpine:latest", label: "Alpine Linux" },
  { value: "debian:11", label: "Debian 11" },
  { value: "fedora:latest", label: "Fedora Latest" },
];

export function LabFormDialog({
  open,
  onOpenChange,
  lab,
  onSubmit,
  loading = false,
}: LabFormDialogProps) {
  const { t } = useTranslation('common');
  const isEditMode = !!lab;
  const submitInProgressRef = useRef(false);
  
  const labFormSchema = createLabFormSchema(t);
  type LabFormData = z.infer<typeof labFormSchema>;

  const form = useForm<LabFormData>({
    resolver: zodResolver(labFormSchema),
    defaultValues: {
      name: "",
      description: "",
      baseImage: "",
      estimatedTime: 60,
    },
  });

  // Reset form when dialog opens/closes or lab changes
  useEffect(() => {
    if (open && lab) {
      form.reset({
        name: lab.name,
        description: lab.description || "",
        baseImage: lab.baseImage,
        estimatedTime: lab.estimatedTime,
      });
    } else if (open && !lab) {
      form.reset({
        name: "",
        description: "",
        baseImage: "",
        estimatedTime: 60,
      });
    }
  }, [open, lab, form]);

  // Enhanced submit handler
  const handleSubmit = async (data: LabFormData) => {
    if (submitInProgressRef.current) return;
    
    try {
      submitInProgressRef.current = true;
      await onSubmit(data);
      
      // Reset form after successful submission
      form.reset();
      
      // Note: onOpenChange will be called by parent component
      // Don't call it here to avoid race conditions
      
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      submitInProgressRef.current = false;
    }
  };

  // Enhanced open change handler
  const handleOpenChange = (newOpen: boolean) => {
    // Prevent closing during submission or when loading
    if (loading || submitInProgressRef.current) {
      return;
    }
    
    if (!newOpen) {
      // Reset form when closing
      form.reset();
    }
    
    onOpenChange(newOpen);
  };

  const handleCancel = () => {
    if (!loading && !submitInProgressRef.current) {
      handleOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          // Prevent closing when loading or submitting
          if (loading || submitInProgressRef.current) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing when loading or submitting
          if (loading || submitInProgressRef.current) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('labs.editLab') : t('labs.createLab')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t('labs.editLabDescription')
              : t('labs.createLabDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labs.labName')} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('labs.labNamePlaceholder')}
                      {...field}
                      disabled={loading}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labs.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('labs.descriptionPlaceholder')}
                      rows={3}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('labs.descriptionHelper')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labs.baseImage')} *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('labs.selectBaseImage')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {baseImages.map((image) => (
                        <SelectItem key={image.value} value={image.value}>
                          {image.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('labs.baseImageHelper')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labs.estimatedTime')} ({t('labs.minutes')}) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('labs.estimatedTimeHelper')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancel}
                disabled={loading || submitInProgressRef.current}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={loading || submitInProgressRef.current}
              >
                {(loading || submitInProgressRef.current) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? t('common.save') : t('labs.createLab')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}