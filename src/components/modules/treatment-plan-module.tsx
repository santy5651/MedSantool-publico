
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { suggestTreatmentPlan, type SuggestTreatmentPlanOutput } from '@/ai/flows/suggest-treatment-plan';
import type { TreatmentPlanInputData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ClipboardPlus, Eraser, Save, Copy, ListChecks } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';

export function TreatmentPlanModule() {
  const {
    // Inputs from other modules
    generatedClinicalAnalysis,
    textAnalysisSummary,
    diagnosisResults,
    // State for this module
    treatmentPlanInput, setTreatmentPlanInput,
    generatedTreatmentPlan, setGeneratedTreatmentPlan,
    isGeneratingTreatmentPlan, setIsGeneratingTreatmentPlan,
    treatmentPlanError, setTreatmentPlanError,
    clearTreatmentPlanModule,
    // For potential integration with Medical Orders
    setMedicalOrderInputs,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  // Effect to assemble input for this module when dependencies change
  useEffect(() => {
    const principalDiagnosis = diagnosisResults?.find(d => d.isPrincipal) || null;
    const newTreatmentInput: TreatmentPlanInputData = {
      clinicalAnalysis: generatedClinicalAnalysis || null,
      textSummary: textAnalysisSummary || null,
      principalDiagnosis: principalDiagnosis ? { code: principalDiagnosis.code, description: principalDiagnosis.description } : null,
    };
    setTreatmentPlanInput(newTreatmentInput);
  }, [generatedClinicalAnalysis, textAnalysisSummary, diagnosisResults, setTreatmentPlanInput]);

  const handleSuggestPlan = async () => {
    if (!treatmentPlanInput.clinicalAnalysis && !treatmentPlanInput.textSummary && !treatmentPlanInput.principalDiagnosis) {
      toast({ title: "Datos Insuficientes", description: "Se requiere al menos un análisis clínico, resumen de texto o diagnóstico principal.", variant: "destructive" });
      return;
    }

    setIsGeneratingTreatmentPlan(true);
    setTreatmentPlanError(null);
    let aiOutput: SuggestTreatmentPlanOutput | null = null;

    const inputForAI = {
      clinicalAnalysis: treatmentPlanInput.clinicalAnalysis || "No disponible.",
      textSummary: treatmentPlanInput.textSummary || "No disponible.",
      principalDiagnosis: treatmentPlanInput.principalDiagnosis || undefined,
    };

    try {
      aiOutput = await suggestTreatmentPlan(inputForAI);
      setGeneratedTreatmentPlan({ suggestedPlanText: aiOutput.suggestedPlanText });
      toast({ title: "Sugerencias de Plan Obtenidas", description: "Se ha generado un plan terapéutico sugerido." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'TreatmentPlanSuggestion',
          inputType: 'application/json',
          inputSummary: `Dx: ${treatmentPlanInput.principalDiagnosis?.code || 'N/A'}, Análisis: ${treatmentPlanInput.clinicalAnalysis ? 'Sí' : 'No'}, Resumen: ${treatmentPlanInput.textSummary ? 'Sí' : 'No'}`,
          outputSummary: getTextSummary(aiOutput.suggestedPlanText, 100),
          fullInput: inputForAI,
          fullOutput: aiOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error suggesting treatment plan:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setTreatmentPlanError(errorMessage);
      setGeneratedTreatmentPlan({ suggestedPlanText: null });
      toast({ title: "Error en Sugerencia de Plan", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'TreatmentPlanSuggestion',
          inputType: 'application/json',
          inputSummary: `Dx: ${treatmentPlanInput.principalDiagnosis?.code || 'N/A'}`,
          outputSummary: 'Error en la sugerencia',
          fullInput: inputForAI,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsGeneratingTreatmentPlan(false);
    }
  };

  const handleClearModule = () => {
    clearTreatmentPlanModule();
    toast({ title: "Módulo Limpiado", description: "Se han limpiado las sugerencias de plan terapéutico." });
  };
  
  const handleOutputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedTreatmentPlan({ suggestedPlanText: event.target.value });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = generatedTreatmentPlan.suggestedPlanText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => toast({ title: "Copiado al Portapapeles", description: "Las sugerencias del plan han sido copiadas." }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: "Nada que Copiar", description: "No hay sugerencias generadas para copiar." });
    }
  };
  
  const handleSaveManually = async () => {
    if (!generatedTreatmentPlan.suggestedPlanText && !treatmentPlanError) {
      toast({ title: "Nada que Guardar", description: "Genere sugerencias primero.", variant: "default" });
      return;
    }
    
    const status = treatmentPlanError ? 'error' : 'completed';
    const output = treatmentPlanError ? { error: treatmentPlanError } : generatedTreatmentPlan;
    const outputSum = treatmentPlanError ? 'Error en la sugerencia' : getTextSummary(generatedTreatmentPlan.suggestedPlanText, 100);
    const inputForHistory = {
      clinicalAnalysis: treatmentPlanInput.clinicalAnalysis || "No disponible.",
      textSummary: treatmentPlanInput.textSummary || "No disponible.",
      principalDiagnosis: treatmentPlanInput.principalDiagnosis || undefined,
    };
    
    await addHistoryEntry({
      module: 'TreatmentPlanSuggestion',
      inputType: 'application/json',
      inputSummary: `Dx: ${treatmentPlanInput.principalDiagnosis?.code || 'N/A'}`,
      outputSummary: outputSum,
      fullInput: inputForHistory,
      fullOutput: output,
      status: status,
      errorDetails: treatmentPlanError || undefined,
    });
  };

  const canGenerate = treatmentPlanInput.clinicalAnalysis || treatmentPlanInput.textSummary || treatmentPlanInput.principalDiagnosis;

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Sugerencia de Plan Terapéutico Asistido por IA"
      description="Genera sugerencias de medicamentos y conductas basadas en el análisis clínico, resumen de texto y diagnóstico principal."
      icon={ListChecks}
      isLoading={isGeneratingTreatmentPlan}
      id="treatment-plan-module"
    >
      <div className="space-y-4">
        <div className="space-y-2 p-3 border rounded-md bg-muted/30 text-sm">
            <h4 className="font-semibold">Datos de Entrada para Sugerencia:</h4>
            <p><strong>Análisis Clínico (M4):</strong> {getTextSummary(treatmentPlanInput.clinicalAnalysis, 70) || "No disponible"}</p>
            <p><strong>Resumen de Texto (M3):</strong> {getTextSummary(treatmentPlanInput.textSummary, 70) || "No disponible"}</p>
            <p><strong>Dx. Principal (M5):</strong> {treatmentPlanInput.principalDiagnosis ? `${treatmentPlanInput.principalDiagnosis.code} - ${getTextSummary(treatmentPlanInput.principalDiagnosis.description, 50)}` : "No seleccionado"}</p>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleSuggestPlan} disabled={!canGenerate || isGeneratingTreatmentPlan} className="flex-1">
            <ClipboardPlus className="mr-2 h-4 w-4" />
            Sugerir Plan Terapéutico
          </Button>
          <Button onClick={handleClearModule} variant="outline" disabled={isGeneratingTreatmentPlan} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>

        {generatedTreatmentPlan.suggestedPlanText !== null && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Plan Terapéutico Sugerido:</h3>
            <Textarea
              value={generatedTreatmentPlan.suggestedPlanText || ''}
              onChange={handleOutputChange}
              rows={10}
              className="bg-muted/30"
              disabled={isGeneratingTreatmentPlan}
            />
            <div className="flex space-x-2">
               <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={isGeneratingTreatmentPlan || !generatedTreatmentPlan.suggestedPlanText}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Sugerencias
              </Button>
              {/* Future button:
              <Button onClick={handleUseInMedicalOrders} variant="default" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Usar en Órdenes Médicas
              </Button>
              */}
            </div>
          </div>
        )}
        {treatmentPlanError && (
          <p className="text-sm text-destructive">Error: {treatmentPlanError}</p>
        )}
        
        {!isAutoSaveEnabled && (generatedTreatmentPlan.suggestedPlanText !== null || treatmentPlanError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2" disabled={isGeneratingTreatmentPlan}>
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
