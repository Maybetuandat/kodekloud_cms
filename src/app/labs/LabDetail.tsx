import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LabDetailHeader } from "@/components/labs/detail/lab-detail-header";
import { LabInfoCard } from "@/components/labs/detail/lab-info-card";
import { SetupStepsList } from "@/components/labs/detail/setup-steps-list";
import { LabFormDialog } from "@/components/labs/lab-form-dialog";
import { LabDeleteDialog } from "@/components/labs/lab-delete-dialog";
import { SetupStepFormDialog } from "@/components/labs/detail/setup-step-form-dialog";
import { Lab, UpdateLabRequest } from "@/types/lab";
import { SetupStep, CreateSetupStepRequest, UpdateSetupStepRequest } from "@/types/setupStep";
import { labService } from "@/services/labService";
import { setupStepService } from "@/services/setupStepService";

export default function LabDetailPage() {
 const { t } = useTranslation('common');
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();

 // State management
 const [lab, setLab] = useState<Lab | null>(null);
 const [setupSteps, setSetupSteps] = useState<SetupStep[]>([]);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(false);

 // Dialog states
 const [editLabDialogOpen, setEditLabDialogOpen] = useState(false);
 const [deleteLabDialogOpen, setDeleteLabDialogOpen] = useState(false);
 const [stepFormDialogOpen, setStepFormDialogOpen] = useState(false);
 const [editingStep, setEditingStep] = useState<SetupStep | null>(null);

 // Fetch lab data
 const fetchLabData = useCallback(async () => {
   if (!id) return;

   try {
     setLoading(true);
     const [labData, stepsData] = await Promise.all([
       labService.getLabById(id),
       labService.getLabSetupSteps(id),
     ]);
     
     setLab(labData);
     setSetupSteps(stepsData);
   } catch (error) {
     console.error("Failed to fetch lab data:", error);
     toast.error(t('labs.loadError'));
     navigate("/labs");
   } finally {
     setLoading(false);
   }
 }, [id, navigate, t]);

 // Load data on mount
 useEffect(() => {
   fetchLabData();
 }, [fetchLabData]);

 // Update lab handler
 const handleUpdateLab = useCallback(async (data: UpdateLabRequest) => {
   if (!lab) return;

   try {
     setActionLoading(true);
     const updatedLab = await labService.updateLab(lab.id, data);
     setLab(updatedLab);
     toast.success(t('labs.updateSuccess', { name: updatedLab.name }));
   } catch (error) {
     console.error("Failed to update lab:", error);
     toast.error(t('labs.updateError'));
     throw error;
   } finally {
     setActionLoading(false);
   }
 }, [lab, t]);

 // Delete lab handler
 const handleDeleteLab = useCallback(async () => {
   if (!lab) return;

   try {
     setActionLoading(true);
     await labService.deleteLab(lab.id);
     toast.success(t('labs.deleteSuccess', { name: lab.name }));
     navigate("/labs");
   } catch (error) {
     console.error("Failed to delete lab:", error);
     toast.error(t('labs.deleteError'));
     throw error;
   } finally {
     setActionLoading(false);
   }
 }, [lab, navigate, t]);

 // Toggle lab status handler
 const handleToggleLabStatus = useCallback(async () => {
   if (!lab) return;

   try {
     setActionLoading(true);
     const updatedLab = await labService.toggleLabStatus(lab.id);
     setLab(updatedLab);
     toast.success(
       t('labs.toggleStatusSuccess', { 
         name: lab.name, 
         status: updatedLab.isActive ? t('labs.activated') : t('labs.deactivated')
       })
     );
   } catch (error) {
     console.error("Failed to toggle lab status:", error);
     toast.error(t('labs.toggleStatusError'));
   } finally {
     setActionLoading(false);
   }
 }, [lab, t]);

 // Create setup step handler
 const handleCreateSetupStep = useCallback(async (data: CreateSetupStepRequest) => {
   if (!lab) return;

   try {
     setActionLoading(true);
     const newStep = await setupStepService.createSetupStep(lab.id, data);
     setSetupSteps(prev => [...prev, newStep].sort((a, b) => a.stepOrder - b.stepOrder));
     toast.success(t('labs.setupStepCreateSuccess', { title: newStep.title }));
     setEditingStep(null);
   } catch (error) {
     console.error("Failed to create setup step:", error);
     toast.error(t('labs.setupStepCreateError'));
     throw error;
   } finally {
     setActionLoading(false);
   }
 }, [lab, t]);

 // Update setup step handler
 const handleUpdateSetupStep = useCallback(async (data: UpdateSetupStepRequest) => {
   try {
     setActionLoading(true);
     const updatedStep = await setupStepService.updateSetupStep(data);
     setSetupSteps(prev => prev.map(step => 
       step.id === data.id ? updatedStep : step
     ));
     toast.success(t('labs.setupStepUpdateSuccess', { title: updatedStep.title }));
     setEditingStep(null);
   } catch (error) {
     console.error("Failed to update setup step:", error);
     toast.error(t('labs.setupStepUpdateError'));
     throw error;
   } finally {
     setActionLoading(false);
   }
 }, [t]);

 // Delete setup step handler
 const handleDeleteSetupStep = useCallback(async (step: SetupStep) => {
   try {
     setActionLoading(true);
     await setupStepService.deleteSetupStep(step.id);
     setSetupSteps(prev => prev.filter(s => s.id !== step.id));
     toast.success(t('labs.setupStepDeleteSuccess', { title: step.title }));
   } catch (error) {
     console.error("Failed to delete setup step:", error);
     toast.error(t('labs.setupStepDeleteError'));
   } finally {
     setActionLoading(false);
   }
 }, [t]);

 // Move step up handler
 const handleMoveStepUp = useCallback(async (step: SetupStep) => {
   const sortedSteps = [...setupSteps].sort((a, b) => a.stepOrder - b.stepOrder);
   const currentIndex = sortedSteps.findIndex(s => s.id === step.id);
   
   if (currentIndex <= 0) return;

   const prevStep = sortedSteps[currentIndex - 1];
   const newStepOrder = prevStep.stepOrder;
   const newPrevStepOrder = step.stepOrder;

   try {
     setActionLoading(true);
     await Promise.all([
       setupStepService.updateSetupStep({ ...step, stepOrder: newStepOrder }),
       setupStepService.updateSetupStep({ ...prevStep, stepOrder: newPrevStepOrder }),
     ]);

     setSetupSteps(prev => prev.map(s => {
       if (s.id === step.id) return { ...s, stepOrder: newStepOrder };
       if (s.id === prevStep.id) return { ...s, stepOrder: newPrevStepOrder };
       return s;
     }));

     toast.success(t('labs.moveStepUpSuccess'));
   } catch (error) {
     console.error("Failed to move step up:", error);
     toast.error(t('labs.moveStepError'));
   } finally {
     setActionLoading(false);
   }
 }, [setupSteps, t]);

 // Move step down handler
 const handleMoveStepDown = useCallback(async (step: SetupStep) => {
   const sortedSteps = [...setupSteps].sort((a, b) => a.stepOrder - b.stepOrder);
   const currentIndex = sortedSteps.findIndex(s => s.id === step.id);
   
   if (currentIndex >= sortedSteps.length - 1) return;

   const nextStep = sortedSteps[currentIndex + 1];
   const newStepOrder = nextStep.stepOrder;
   const newNextStepOrder = step.stepOrder;

   try {
     setActionLoading(true);
     await Promise.all([
       setupStepService.updateSetupStep({ ...step, stepOrder: newStepOrder }),
       setupStepService.updateSetupStep({ ...nextStep, stepOrder: newNextStepOrder }),
     ]);

     setSetupSteps(prev => prev.map(s => {
       if (s.id === step.id) return { ...s, stepOrder: newStepOrder };
       if (s.id === nextStep.id) return { ...s, stepOrder: newNextStepOrder };
       return s;
     }));

     toast.success(t('labs.moveStepDownSuccess'));
   } catch (error) {
     console.error("Failed to move step down:", error);
     toast.error(t('labs.moveStepError'));
   } finally {
     setActionLoading(false);
   }
 }, [setupSteps, t]);

 // Dialog handlers
 const openCreateStepDialog = () => {
   setEditingStep(null);
   setStepFormDialogOpen(true);
 };

 const openEditStepDialog = (step: SetupStep) => {
   setEditingStep(step);
   setStepFormDialogOpen(true);
 };

 // Show loading state
 if (loading) {
   return (
     <div className="container mx-auto px-4 py-6">
       <div className="flex items-center justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         <span className="ml-2 text-muted-foreground">{t('labs.loadingLab')}</span>
       </div>
     </div>
   );
 }

 // Show not found if lab doesn't exist
 if (!lab) {
   return (
     <div className="container mx-auto px-4 py-6">
       <div className="text-center py-12">
         <h1 className="text-2xl font-bold mb-2">{t('labs.notFound')}</h1>
         <p className="text-muted-foreground mb-4">
           {t('labs.notFoundDescription')}
         </p>
         <button 
           onClick={() => navigate("/labs")}
           className="text-primary hover:underline"
         >
           {t('labs.backToList')}
         </button>
       </div>
     </div>
   );
 }

 return (
   <div className="container mx-auto px-4 py-6 space-y-6">
     {/* Header */}
     <LabDetailHeader
       lab={lab}
       onEdit={() => setEditLabDialogOpen(true)}
       onDelete={() => setDeleteLabDialogOpen(true)}
       onToggleStatus={handleToggleLabStatus}
       loading={actionLoading}
     />

     {/* Content */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Lab Info */}
       <div className="lg:col-span-1">
         <LabInfoCard lab={lab} />
       </div>

       {/* Setup Steps */}
       <div className="lg:col-span-2">
         <SetupStepsList
           steps={setupSteps}
           onCreateStep={openCreateStepDialog}
           onEditStep={openEditStepDialog}
           onDeleteStep={handleDeleteSetupStep}
           onMoveStepUp={handleMoveStepUp}
           onMoveStepDown={handleMoveStepDown}
           loading={actionLoading}
         />
       </div>
     </div>

     {/* Dialogs */}
     <LabFormDialog
       open={editLabDialogOpen}
       onOpenChange={setEditLabDialogOpen}
       lab={lab}
       onSubmit={handleUpdateLab}
       loading={actionLoading}
     />

     <LabDeleteDialog
       open={deleteLabDialogOpen}
       onOpenChange={setDeleteLabDialogOpen}
       lab={lab}
       onConfirm={handleDeleteLab}
       loading={actionLoading}
     />

     <SetupStepFormDialog
       open={stepFormDialogOpen}
       onOpenChange={setStepFormDialogOpen}
       setupStep={editingStep}
       onSubmit={editingStep ? (data => handleUpdateSetupStep(data as UpdateSetupStepRequest)) : handleCreateSetupStep}
       loading={actionLoading}
     />
   </div>
 );
}