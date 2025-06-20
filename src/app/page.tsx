
'use client';

import React, { useState } from 'react';
import { ImageAnalysisModule } from '@/components/modules/image-analysis-module';
import { PdfExtractionModule } from '@/components/modules/pdf-extraction-module';
import { TextAnalysisModule } from '@/components/modules/text-analysis-module';
import { ClinicalAnalysisModule } from '@/components/modules/clinical-analysis-module';
import { DiagnosisSupportModule } from '@/components/modules/diagnosis-support-module';
import { TreatmentPlanModule } from '@/components/modules/treatment-plan-module';
import { MedicalOrdersModule } from '@/components/modules/medical-orders-module';
import { PatientAdviceModule } from '@/components/modules/patient-advice-module';
import { DischargeSummaryModule } from '@/components/modules/discharge-summary-module'; // Added import
import { MedicalJustificationModule } from '@/components/modules/medical-justification-module';
import { MedicalAssistantChatModule } from '@/components/modules/medical-assistant-chat-module';
import { DoseCalculatorModule } from '@/components/modules/dose-calculator-module';
import { HistoryModule } from '@/components/modules/history-module';
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

export default function MedSanToolsPage() {
  const { activeView, expandedModuleId } = useView();
  const {
    clearImageModule,
    clearPdfModule,
    clearTextModule,
    clearClinicalAnalysisModule,
    clearDiagnosisModule,
    clearTreatmentPlanModule,
    clearMedicalOrdersModule,
    clearPatientAdviceModule,
    clearDischargeSummaryModule, // Added clearDischargeSummaryModule
    clearMedicalJustificationModule,
    clearChatModule,
    clearDoseCalculatorModule,
  } = useClinicalData();
  const { toast } = useToast();
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const handleClearAllModules = () => {
    clearImageModule();
    clearPdfModule();
    clearTextModule();
    clearClinicalAnalysisModule();
    clearDiagnosisModule();
    clearTreatmentPlanModule();
    clearMedicalOrdersModule();
    clearPatientAdviceModule();
    clearDischargeSummaryModule(); // Added call to clearDischargeSummaryModule
    clearMedicalJustificationModule();
    clearChatModule();
    clearDoseCalculatorModule();
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
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'pdf-extraction-module') && <PdfExtractionModule id="pdf-extraction-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'text-analysis-module') && <TextAnalysisModule id="text-analysis-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'clinical-analysis-module') && <ClinicalAnalysisModule id="clinical-analysis-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'diagnosis-support-module') && <DiagnosisSupportModule id="diagnosis-support-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'treatment-plan-module') && <TreatmentPlanModule id="treatment-plan-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'medical-orders-module') && <MedicalOrdersModule id="medical-orders-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'patient-advice-module') && <PatientAdviceModule id="patient-advice-module" /> }
        { (activeView === 'analysis' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'discharge-summary-module') && <DischargeSummaryModule id="discharge-summary-module" /> }
        
        {/* Otras Herramientas */}
        { (activeView === 'other' || activeView === 'all') && (!expandedModuleId || expandedModuleId === 'image-analysis-module') && <ImageAnalysisModule id="image-analysis-module" /> }
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

    
