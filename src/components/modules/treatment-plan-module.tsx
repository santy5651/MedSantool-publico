
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { suggestTreatmentPlan, type SuggestTreatmentPlanOutput } from '@/ai/flows/suggest-treatment-plan';
import type { TreatmentPlanInputData, ValidatedDiagnosis } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ClipboardPlus, Eraser, Save, Copy, ListChecks } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';
import { useApiKey } from '@/contexts/api-key-context';

interface TreatmentPlanModuleProps {
  id?: string;
}

export function TreatmentPlanModule({ id }: TreatmentPlanModuleProps) {
  const {
    generatedClinicalAnalysis,
    textAnalysisSummary,
    diagnosisResults,
    treatmentPlanInput, setTreatmentPlanInput,
    generatedTreatmentPlan, setGeneratedTreatmentPlan,
    isGeneratingTreatmentPlan, setIsGeneratingTreatmentPlan,
    treatmentPlanError, setTreatmentPlanError,
    clearTreatmentPlanModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { apiKey, openKeyModal } = useApiKey();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const validatedDiagnoses: ValidatedDiagnosis[] = diagnosisResults
      ?.filter(d => d.isValidated)
      .map(d => ({ code: d.code, description: d.description })) || [];

    const newTreatmentInput: TreatmentPlanInputData = {
      clinicalAnalysis: generatedClinicalAnalysis?.comprehensiveAnalysis || null,
      textSummary: textAnalysisSummary || null,
      validatedDiagnoses: validatedDiagnoses.length > 0 ? validatedDiagnoses : null,
    };
    setTreatmentPlanInput(newTreatmentInput);
  }, [generatedClinicalAnalysis, textAnalysisSummary, diagnosisResults, setTreatmentPlanInput]);

  const handleSuggestPlan = async () => {
    if (!apiKey) {
      openKeyModal();
      return;
    }
    if (!treatmentPlanInput.clinicalAnalysis && !treatmentPlanInput.textSummary && (!treatmentPlanInput.validatedDiagnoses || treatmentPlanInput.validatedDiagnoses.length === 0)) {
      toast({ title: "Datos Insuficientes", description: "Se requiere al menos un análisis clínico, resumen de texto o diagnósticos validados.", variant: "destructive" });
      return;
    }

    setIsGeneratingTreatmentPlan(true);
    setTreatmentPlanError(null);
    let aiOutput: SuggestTreatmentPlanOutput | null = null;

    const inputForAI = {
      clinicalAnalysis: treatmentPlanInput.clinicalAnalysis || "No disponible.",
      textSummary: treatmentPlanInput.textSummary || "No disponible.",
      validatedDiagnoses: treatmentPlanInput.validatedDiagnoses || undefined,
    };

    try {
      aiOutput = await suggestTreatmentPlan({ ...inputForAI, apiKey });
      setGeneratedTreatmentPlan({ suggestedPlanText: aiOutput.suggestedPlanText });
      toast({ title: "Sugerencias de Plan Obtenidas", description: "Se ha generado un plan terapéutico sugerido." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'TreatmentPlanSuggestion',
          inputType: 'application/json',
          inputSummary: `Dx Validados: ${treatmentPlanInput.validatedDiagnoses?.length || 0}, Análisis: ${treatmentPlanInput.clinicalAnalysis ? 'Sí' : 'No'}, Resumen: ${treatmentPlanInput.textSummary ? 'Sí' : 'No'}`,
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
          inputSummary: `Dx Validados: ${treatmentPlanInput.validatedDiagnoses?.length || 0}`,
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
      validatedDiagnoses: treatmentPlanInput.validatedDiagnoses || undefined,
    };
    
    await addHistoryEntry({
      module: 'TreatmentPlanSuggestion',
      inputType: 'application/json',
      inputSummary: `Dx Validados: ${treatmentPlanInput.validatedDiagnoses?.length || 0}, Análisis: ${!!treatmentPlanInput.clinicalAnalysis}, Resumen: ${!!treatmentPlanInput.textSummary}`,
      outputSummary: outputSum,
      fullInput: inputForHistory,
      fullOutput: output,
      status: status,
      errorDetails: treatmentPlanError || undefined,
    });
  };

  const canGenerate = treatmentPlanInput.clinicalAnalysis || treatmentPlanInput.textSummary || (treatmentPlanInput.validatedDiagnoses && treatmentPlanInput.validatedDiagnoses.length > 0);

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Sugerencia de Plan Terapéutico Asistido por IA"
      description="Genera sugerencias de medicamentos y conductas basadas en el análisis clínico, resumen de texto y diagnósticos validados."
      icon={ListChecks}
      isLoading={isGeneratingTreatmentPlan}
    >
      <div className="space-y-4">
        <div className="space-y-2 p-3 border rounded-md bg-muted/30 text-sm">
            <h4 className="font-semibold">Datos de Entrada para Sugerencia:</h4>
            <p><strong>Análisis Clínico (M4):</strong> {getTextSummary(treatmentPlanInput.clinicalAnalysis, 70) || "No disponible"}</p>
            <p><strong>Resumen de Texto (M3):</strong> {getTextSummary(treatmentPlanInput.textSummary, 70) || "No disponible"}</p>
            <div>
              <strong>Dx. Validados (M5):</strong>
              {treatmentPlanInput.validatedDiagnoses && treatmentPlanInput.validatedDiagnoses.length > 0 ? (
                <ul className="list-disc pl-5">
                  {treatmentPlanInput.validatedDiagnoses.map(dx => (
                    <li key={dx.code}>{dx.code} - {getTextSummary(dx.description, 50)}</li>
                  ))}
                </ul>
              ) : (
                " Ninguno seleccionado"
              )}
            </div>
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
