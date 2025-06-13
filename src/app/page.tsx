
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

export default function MedInsightPage() {
  const {
    clearImageModule,
    clearPdfModule,
    clearTextModule,
    clearClinicalAnalysisModule,
    clearDiagnosisModule,
    clearTreatmentPlanModule,
    clearMedicalOrdersModule,
    clearPatientAdviceModule,
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

      <div className="space-y-6">
        {/* Analysis Modules Section */}
        <div className="space-y-6">
          <ImageAnalysisModule />
          <PdfExtractionModule />
          <TextAnalysisModule />
          <ClinicalAnalysisModule />
          <DiagnosisSupportModule />
          <TreatmentPlanModule />
          <MedicalOrdersModule />
          <PatientAdviceModule />
        </div>

        {/* History Module Section - Moved to the bottom */}
        <div className="mt-12 pt-6 border-t"> {/* Added margin and a top border for separation */}
          <HistoryModule />
        </div>
      </div>
    </>
  );
}
