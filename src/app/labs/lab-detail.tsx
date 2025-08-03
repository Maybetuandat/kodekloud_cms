import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LabDetailHeader } from "@/components/labs/detail/index/lab-detail-header";
import { LabInfoCard } from "@/components/labs/detail/index/lab-info-card";
import { SetupStepsList } from "@/components/labs/detail/index/setup-steps-list";
import { LabFormDialog } from "@/components/labs/index/lab-form-dialog";
import { LabDeleteDialog } from "@/components/labs/index/lab-delete-dialog";
import { SetupStepFormDialog } from "@/components/labs/detail/index/setup-step-form-dialog";
import { Lab, UpdateLabRequest } from "@/types/lab";
import { SetupStep, CreateSetupStepRequest, UpdateSetupStepRequest } from "@/types/setupStep";
import { labService } from "@/services/labService";
import { setupStepService } from "@/services/setupStepService";


import { TerminalDialog } from "@/components/labs/detail/terminal/terminal-dialog";
import { LabTestResponse } from "@/types/labTest";

export default function LabDetailPage() {
  const { t } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

 const [terminalDialogOpen, setTerminalDialogOpen] = useState(false);
  const [terminalConfig, setTerminalConfig] = useState<{
    websocketUrl: string;
    podName: string;
    labName: string;
  } | null>(null);
  // State management
  const [lab, setLab] = useState<Lab | null>(null);
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states với enhanced control
  const [editLabDialogOpen, setEditLabDialogOpen] = useState(false);
  const [deleteLabDialogOpen, setDeleteLabDialogOpen] = useState(false);
  const [stepFormDialogOpen, setStepFormDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<SetupStep | null>(null);

  // Focus management states
  const [isLabDialogClosing, setIsLabDialogClosing] = useState(false);
  const [isDeleteDialogClosing, setIsDeleteDialogClosing] = useState(false);
  const [isStepDialogClosing, setIsStepDialogClosing] = useState(false);
  
  const labDialogTimeoutRef = useRef<NodeJS.Timeout>();
  const deleteDialogTimeoutRef = useRef<NodeJS.Timeout>();
  const stepDialogTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (labDialogTimeoutRef.current) clearTimeout(labDialogTimeoutRef.current);
      if (deleteDialogTimeoutRef.current) clearTimeout(deleteDialogTimeoutRef.current);
      if (stepDialogTimeoutRef.current) clearTimeout(stepDialogTimeoutRef.current);
    };
  }, []);

  // Focus cleanup utility
  const clearFocusTraps = useCallback(() => {
    // Remove any lingering focus guard elements
    const focusGuards = document.querySelectorAll('[data-radix-focus-guard]');
    focusGuards.forEach(guard => {
      if (guard.parentNode) {
        guard.parentNode.removeChild(guard);
      }
    });
    
    // Remove any orphaned dialog overlays
    const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
    overlays.forEach(overlay => {
      const content = overlay.parentNode?.querySelector('[data-radix-dialog-content]');
      if (!content) {
        overlay.remove();
      }
    });
    
    // Ensure body is focusable and restore normal interaction
    document.body.tabIndex = -1;
    document.body.focus();
    document.body.blur();
    document.body.removeAttribute('tabindex');
    
    // Clear any pointer-events blocks
    document.body.style.pointerEvents = '';
  }, []);

  // Enhanced dialog close handlers
  const handleLabDialogClose = useCallback((callback?: () => void) => {
    setIsLabDialogClosing(true);
    
    if (labDialogTimeoutRef.current) {
      clearTimeout(labDialogTimeoutRef.current);
    }
    
    labDialogTimeoutRef.current = setTimeout(() => {
      if (callback) callback();
      
      setTimeout(() => {
        setIsLabDialogClosing(false);
        clearFocusTraps();
      }, 100);
    }, 150);
  }, [clearFocusTraps]);

  const handleDeleteDialogClose = useCallback((callback?: () => void) => {
    setIsDeleteDialogClosing(true);
    
    if (deleteDialogTimeoutRef.current) {
      clearTimeout(deleteDialogTimeoutRef.current);
    }
    
    deleteDialogTimeoutRef.current = setTimeout(() => {
      if (callback) callback();
      
      setTimeout(() => {
        setIsDeleteDialogClosing(false);
        clearFocusTraps();
      }, 100);
    }, 150);
  }, [clearFocusTraps]);

  const handleStepDialogClose = useCallback((callback?: () => void) => {
    setIsStepDialogClosing(true);
    
    if (stepDialogTimeoutRef.current) {
      clearTimeout(stepDialogTimeoutRef.current);
    }
    
    stepDialogTimeoutRef.current = setTimeout(() => {
      if (callback) callback();
      
      setTimeout(() => {
        setIsStepDialogClosing(false);
        clearFocusTraps();
      }, 100);
    }, 150);
  }, [clearFocusTraps]);

  // Fetch lab data
  const fetchLabData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [labData, stepsData] = await Promise.all([
        labService.getLabById(id),
        setupStepService.getLabSetupSteps(id),
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

  // Enhanced update lab handler
  const handleUpdateLab = useCallback(async (data: UpdateLabRequest) => {
    if (!lab) return;

    try {
      setActionLoading(true);
      const updatedLab = await labService.updateLab(lab.id, data);
      setLab(updatedLab);
      toast.success(t('labs.updateSuccess', { name: updatedLab.name }));
      
      // Close dialog with proper cleanup
      handleLabDialogClose(() => setEditLabDialogOpen(false));
      
    } catch (error) {
      console.error("Failed to update lab:", error);
      toast.error(t('labs.updateError'));
      throw error;
    } finally {
      setTimeout(() => {
        setActionLoading(false);
      }, 200);
    }
  }, [lab, t, handleLabDialogClose]);

  // Enhanced delete lab handler
  const handleDeleteLab = useCallback(async () => {
    if (!lab) return;

    try {
      setActionLoading(true);
      await labService.deleteLab(lab.id);
      toast.success(t('labs.deleteSuccess', { name: lab.name }));
      
      // Navigate after successful deletion
      setTimeout(() => {
        navigate("/labs");
      }, 100);
      
    } catch (error) {
      console.error("Failed to delete lab:", error);
      toast.error(t('labs.deleteError'));
      throw error;
    } finally {
      setTimeout(() => {
        setActionLoading(false);
      }, 200);
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

  // Enhanced create setup step handler
  const handleCreateSetupStep = useCallback(async (data: CreateSetupStepRequest) => {
    if (!lab) return;

    try {
      setActionLoading(true);
      const newStep = await setupStepService.createSetupStep(lab.id, data);
      setSetupSteps(prev => [...prev, newStep].sort((a, b) => a.stepOrder - b.stepOrder));
      toast.success(t('labs.setupStepCreateSuccess', { title: newStep.title }));
      
      // Close dialog with proper cleanup
      handleStepDialogClose(() => {
        setStepFormDialogOpen(false);
        setEditingStep(null);
      });
      
    } catch (error) {
      console.error("Failed to create setup step:", error);
      toast.error(t('labs.setupStepCreateError'));
      throw error;
    } finally {
      setTimeout(() => {
        setActionLoading(false);
      }, 200);
    }
  }, [lab, t, handleStepDialogClose]);

  // Enhanced update setup step handler
  const handleUpdateSetupStep = useCallback(async (data: UpdateSetupStepRequest) => {
    try {
      setActionLoading(true);
      const updatedStep = await setupStepService.updateSetupStep(data);
      setSetupSteps(prev => prev.map(step => 
        step.id === data.id ? updatedStep : step
      ));
      toast.success(t('labs.setupStepUpdateSuccess', { title: updatedStep.title }));
      
      // Close dialog with proper cleanup
      handleStepDialogClose(() => {
        setStepFormDialogOpen(false);
        setEditingStep(null);
      });
      
    } catch (error) {
      console.error("Failed to update setup step:", error);
      toast.error(t('labs.setupStepUpdateError'));
      throw error;
    } finally {
      setTimeout(() => {
        setActionLoading(false);
      }, 200);
    }
  }, [t, handleStepDialogClose]);


  // const handleTestSetupStep = useCallback(async(labId : string) => {
  //   try
  //   {
  //         setActionLoading(true);
  //         const result = await labService.testSetupStep(labId);
  //         if(result.success) {
  //           toast.success(result.message + ' ' + result.podName);
  //         }
  //         else
  //         {
  //           toast.error(result.error);
  //         }
  //   }
  //   catch (error) {
  //     console.error("Failed to test setup step:", error);
  //     toast.error(t('labs.setupStepTestError'));
  //   }
  //   finally {
  //     setActionLoading(false);
  //   }
  // }, [t, labService]);  // dependencies array : function se duoc tao khi cac thanh phan nay thay doi





  const handleTestSetupStep = useCallback(async (labId: string) => {
  try {
    setActionLoading(true);
    
    // Call the test API with proper typing
    const result: LabTestResponse = await labService.testSetupStep(labId);
    
    // Check if response is successful
    if (result.success) {
      // Show success toast
      toast.success(result.message || "Lab test đã được khởi tạo thành công");
      
      // Extract WebSocket information from response
      const websocketInfo = result.websocket;
      if (websocketInfo && websocketInfo.url) {
        // Configure terminal dialog
        setTerminalConfig({
          websocketUrl: websocketInfo.url,
          podName: result.podName,
          labName: result.labName || lab?.name || "Unknown Lab"
        });
        
        // Open terminal dialog
        setTerminalDialogOpen(true);
        
        console.log("WebSocket connection info:", websocketInfo);
        console.log("Pod created:", result.podName);
        console.log("Lab:", result.labName);
      } else {
        // Fallback if no WebSocket info provided
        toast.warning("Pod created successfully but no WebSocket info available");
        console.warn("No WebSocket info in response:", result);
      }
    } else {
      // Show error toast if response indicates failure
      toast.error(result.error || "Không thể tạo test pod");
      console.error("Test failed:", result);
    }
  } catch (error: any) {
    console.error("Failed to test setup step:", error);
    
    // Handle different types of errors
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      toast.error("Lab không tồn tại");
    } else if (error.message?.includes('500') || error.message?.includes('server')) {
      toast.error("Lỗi server: " + (error.message || "Không thể kết nối tới server"));
    } else if (error.message?.includes('Network')) {
      toast.error("Lỗi kết nối mạng: Không thể kết nối tới server");
    } else if (error.message) {
      toast.error("Lỗi: " + error.message);
    } else {
      toast.error("Có lỗi xảy ra khi test setup steps");
    }
  } finally {
    setActionLoading(false);
  }
}, [lab, labService, toast]);

const handleTerminalDialogClose = useCallback(async () => {
  if (terminalConfig?.podName && lab?.id) {
    try {
      // Optionally call API to stop the test pod
      await labService.stopTestExecution(lab.id, terminalConfig.podName);
      toast.success("Test pod đã được dừng");
    } catch (error) {
      console.warn("Failed to stop test pod:", error);
      // Don't show error toast as this is cleanup
    }
  }
  
  setTerminalDialogOpen(false);
  setTerminalConfig(null);
}, [terminalConfig, lab, labService, toast]);
  
    
  
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

  // Enhanced dialog handlers
  const openCreateStepDialog = () => {
    setEditingStep(null);
    setIsStepDialogClosing(false);
    setStepFormDialogOpen(true);
  };

  const openEditStepDialog = (step: SetupStep) => {
    setEditingStep(step);
    setIsStepDialogClosing(false);
    setStepFormDialogOpen(true);
  };

  // Enhanced dialog close handlers for UI
  const handleEditLabDialogClose = (open: boolean) => {
    if (actionLoading || isLabDialogClosing) return;
    
    if (!open) {
      handleLabDialogClose(() => setEditLabDialogOpen(false));
    } else {
      setEditLabDialogOpen(open);
    }
  };

  const handleDeleteLabDialogClose = (open: boolean) => {
    if (actionLoading || isDeleteDialogClosing) return;
    
    if (!open) {
      handleDeleteDialogClose(() => setDeleteLabDialogOpen(false));
    } else {
      setDeleteLabDialogOpen(open);
    }
  };

  const handleStepFormDialogClose = (open: boolean) => {
    if (actionLoading || isStepDialogClosing) return;
    
    if (!open) {
      handleStepDialogClose(() => setStepFormDialogOpen(false));
    } else {
      setStepFormDialogOpen(open);
    }
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
    <div className="min-h-screen w-full px-4 py-6 space-y-6">
      {/* Header */}
      <LabDetailHeader
        lab={lab}
        onEdit={() => {
          setIsLabDialogClosing(false);
          setEditLabDialogOpen(true);
        }}
        onDelete={() => {
          setIsDeleteDialogClosing(false);
          setDeleteLabDialogOpen(true);
        }}
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
            testSetupStep={handleTestSetupStep}
            labId={lab.id}
          />
        </div>
      </div>

      {/* Enhanced Dialogs với better state management */}
      <LabFormDialog
        open={editLabDialogOpen && !isLabDialogClosing}
        onOpenChange={handleEditLabDialogClose}
        lab={lab}
        onSubmit={handleUpdateLab}
        loading={actionLoading}
      />

      <LabDeleteDialog
        open={deleteLabDialogOpen && !isDeleteDialogClosing}
        onOpenChange={handleDeleteLabDialogClose}
        lab={lab}
        onConfirm={handleDeleteLab}
        loading={actionLoading}
      />

      <SetupStepFormDialog
        open={stepFormDialogOpen && !isStepDialogClosing}
        onOpenChange={handleStepFormDialogClose}
        setupStep={editingStep}
        onSubmit={editingStep ? 
          (data => handleUpdateSetupStep(data as UpdateSetupStepRequest)) : 
          handleCreateSetupStep
        }
        loading={actionLoading}
      />
      {/* Terminal Dialog for live logs */}
      {terminalConfig && (
        <TerminalDialog
          open={terminalDialogOpen}
          onOpenChange={setTerminalDialogOpen}
          websocketUrl={terminalConfig.websocketUrl}
          podName={terminalConfig.podName}
          labName={terminalConfig.labName}
          onClose={handleTerminalDialogClose}
        />
      )}
    </div>
  );
}