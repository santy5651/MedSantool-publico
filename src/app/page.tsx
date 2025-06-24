
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useView } from '@/contexts/view-context';
import { cn } from '@/lib/utils';

const ModuleLoadingSkeleton = () => (
    <div className="p-4 border rounded-lg shadow-sm bg-card h-[300px] flex flex-col">
        <div className="space-y-2 mb-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-4 mt-4 flex-grow">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
    </div>
);

const ImageAnalysisModule = dynamic(() => import('@/components/modules/image-analysis-module').then(mod => mod.ImageAnalysisModule), { loading: () => <ModuleLoadingSkeleton /> });
const PdfExtractionModule = dynamic(() => import('@/components/modules/pdf-extraction-module').then(mod => mod.PdfExtractionModule), { loading: () => <ModuleLoadingSkeleton /> });
const TextAnalysisModule = dynamic(() => import('@/components/modules/text-analysis-module').then(mod => mod.TextAnalysisModule), { loading: () => <ModuleLoadingSkeleton /> });
const PhysicalExamModule = dynamic(() => import('@/components/modules/physical-exam-module').then(mod => mod.PhysicalExamModule), { loading: () => <ModuleLoadingSkeleton /> });
const ClinicalAnalysisModule = dynamic(() => import('@/components/modules/clinical-analysis-module').then(mod => mod.ClinicalAnalysisModule), { loading: () => <ModuleLoadingSkeleton /> });
const DiagnosisSupportModule = dynamic(() => import('@/components/modules/diagnosis-support-module').then(mod => mod.DiagnosisSupportModule), { loading: () => <ModuleLoadingSkeleton /> });
const TreatmentPlanModule = dynamic(() => import('@/components/modules/treatment-plan-module').then(mod => mod.TreatmentPlanModule), { loading: () => <ModuleLoadingSkeleton /> });
const MedicalOrdersModule = dynamic(() => import('@/components/modules/medical-orders-module').then(mod => mod.MedicalOrdersModule), { loading: () => <ModuleLoadingSkeleton /> });
const PatientAdviceModule = dynamic(() => import('@/components/modules/patient-advice-module').then(mod => mod.PatientAdviceModule), { loading: () => <ModuleLoadingSkeleton /> });
const DischargeSummaryModule = dynamic(() => import('@/components/modules/discharge-summary-module').then(mod => mod.DischargeSummaryModule), { loading: () => <ModuleLoadingSkeleton /> });
const MedicalJustificationModule = dynamic(() => import('@/components/modules/medical-justification-module').then(mod => mod.MedicalJustificationModule), { loading: () => <ModuleLoadingSkeleton /> });
const MedicalAssistantChatModule = dynamic(() => import('@/components/modules/medical-assistant-chat-module').then(mod => mod.MedicalAssistantChatModule), { loading: () => <ModuleLoadingSkeleton /> });
const DoseCalculatorModule = dynamic(() => import('@/components/modules/dose-calculator-module').then(mod => mod.DoseCalculatorModule), { loading: () => <ModuleLoadingSkeleton /> });
const HistoryModule = dynamic(() => import('@/components/modules/history-module').then(mod => mod.HistoryModule), { loading: () => <ModuleLoadingSkeleton /> });
const LabStandardizerModule = dynamic(() => import('@/components/modules/lab-standardizer-module').then(mod => mod.LabStandardizerModule), { loading: () => <ModuleLoadingSkeleton /> });


export default function MedSanToolsPage() {
  const { activeView, expandedModuleId } = useView();
  const {
    clearImageModule,
    clearPdfModule,
    clearTextModule,
    clearPhysicalExamModule,
    clearClinicalAnalysisModule,
    clearDiagnosisModule,
    clearTreatmentPlanModule,
    clearMedicalOrdersModule,
    clearPatientAdviceModule,
    clearDischargeSummaryModule, 
    clearMedicalJustificationModule,
    clearChatModule,
    clearDoseCalculatorModule,
    clearLabStandardizerModule,
  } = useClinicalData();
  const { toast } = useToast();
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const handleClearAllModules = () => {
    clearImageModule();
    clearPdfModule();
    clearTextModule();
    clearPhysicalExamModule();
    clearClinicalAnalysisModule();
    clearDiagnosisModule();
    clearTreatmentPlanModule();
    clearMedicalOrdersModule();
    clearPatientAdviceModule;
    clearDischargeSummaryModule(); 
    clearMedicalJustificationModule();
    clearChatModule();
    clearDoseCalculatorModule();
    clearLabStandardizerModule();
    toast({
      title: "Todos los Módulos Limpiados",
      description: "Se ha restablecido el estado de todos los módulos de datos.",
    });
    setShowClearAllConfirm(false);
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <AlertDialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Eraser className="mr-2 h-4 w-4" />
              Limpiar Todos los Módulos
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se restablecerán todos los datos ingresados y generados en los módulos. El historial de trabajo no se verá afectado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllModules}>Confirmar Limpieza</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div
        className={cn(
          "grid gap-6", 
          expandedModuleId ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2" 
        )}
      >
        {/* Herramientas de Análisis */}
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'text-analysis-module') && <TextAnalysisModule id="text-analysis-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'clinical-analysis-module') && <ClinicalAnalysisModule id="clinical-analysis-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'diagnosis-support-module') && <DiagnosisSupportModule id="diagnosis-support-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'physical-exam-module') && <PhysicalExamModule id="physical-exam-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'treatment-plan-module') && <TreatmentPlanModule id="treatment-plan-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'medical-orders-module') && <MedicalOrdersModule id="medical-orders-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'patient-advice-module') && <PatientAdviceModule id="patient-advice-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'discharge-summary-module') && <DischargeSummaryModule id="discharge-summary-module" /> }
        
        {/* Otras Herramientas */}
        { (activeView === 'other' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'pdf-extraction-module') && <PdfExtractionModule id="pdf-extraction-module" /> }
        { (activeView === 'other' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'image-analysis-module') && <ImageAnalysisModule id="image-analysis-module" /> }
        { (activeView === 'other' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'lab-standardizer-module') && <LabStandardizerModule id="lab-standardizer-module" /> }
        { (activeView === 'other' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'medical-justification-module') && <MedicalJustificationModule id="medical-justification-module" /> }
        { (activeView === 'other' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'medical-assistant-chat-module') && <MedicalAssistantChatModule id="medical-assistant-chat-module" /> }
        { (activeView === 'other' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'dose-calculator-module') && <DoseCalculatorModule id="dose-calculator-module" /> }
      </div>

      {/* History Module Section - se muestra siempre abajo y a todo lo ancho */}
      <div className="mt-12 pt-6 border-t">
        <HistoryModule /> 
      </div>
    </>
  );
}
