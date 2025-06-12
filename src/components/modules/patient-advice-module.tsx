
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generatePatientAdvice, type GeneratePatientAdviceOutput, type GeneratePatientAdviceInput } from '@/ai/flows/generate-patient-advice';
import type { PatientAdviceInputData, ValidatedDiagnosis, PatientAdviceOutputState } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Eraser, Save, Copy, AlertTriangle, ALargeSmall } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';

export function PatientAdviceModule() {
  const {
    // Inputs from other modules
    generatedClinicalAnalysis,
    textAnalysisSummary,
    diagnosisResults,
    // State for this module
    patientAdviceInput, setPatientAdviceInput,
    generatedPatientAdvice, setGeneratedPatientAdvice,
    isGeneratingPatientAdvice, setIsGeneratingPatientAdvice,
    patientAdviceError, setPatientAdviceError,
    clearPatientAdviceModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  // Effect to assemble input for this module when dependencies change
  useEffect(() => {
    const validatedDiagnoses: ValidatedDiagnosis[] = diagnosisResults
      ?.filter(d => d.isValidated)
      .map(d => ({ code: d.code, description: d.description })) || [];

    const newPatientAdviceInput: PatientAdviceInputData = {
      clinicalAnalysis: generatedClinicalAnalysis || null,
      textSummary: textAnalysisSummary || null,
      validatedDiagnoses: validatedDiagnoses.length > 0 ? validatedDiagnoses : null,
    };
    setPatientAdviceInput(newPatientAdviceInput);
  }, [generatedClinicalAnalysis, textAnalysisSummary, diagnosisResults, setPatientAdviceInput]);

  const handleGenerateAdvice = async () => {
    if (!patientAdviceInput.clinicalAnalysis && !patientAdviceInput.textSummary && (!patientAdviceInput.validatedDiagnoses || patientAdviceInput.validatedDiagnoses.length === 0)) {
      toast({ title: "Datos Insuficientes", description: "Se requiere al menos un análisis clínico, resumen de texto o diagnósticos validados.", variant: "destructive" });
      return;
    }

    setIsGeneratingPatientAdvice(true);
    setPatientAdviceError(null);
    let aiOutput: GeneratePatientAdviceOutput | null = null;

    const inputForAI: GeneratePatientAdviceInput = {
      clinicalAnalysis: patientAdviceInput.clinicalAnalysis || undefined,
      textSummary: patientAdviceInput.textSummary || undefined,
      validatedDiagnoses: patientAdviceInput.validatedDiagnoses || undefined,
    };

    try {
      aiOutput = await generatePatientAdvice(inputForAI);
      setGeneratedPatientAdvice({ 
        generalRecommendations: aiOutput.generalRecommendations,
        alarmSigns: aiOutput.alarmSigns 
      });
      toast({ title: "Consejos Generados", description: "Se han generado recomendaciones y signos de alarma para el paciente." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'PatientAdvice',
          inputType: 'application/json',
          inputSummary: `Dx Validados: ${patientAdviceInput.validatedDiagnoses?.length || 0}, Análisis: ${patientAdviceInput.clinicalAnalysis ? 'Sí' : 'No'}, Resumen: ${patientAdviceInput.textSummary ? 'Sí' : 'No'}`,
          outputSummary: `Recomendaciones: ${getTextSummary(aiOutput.generalRecommendations, 30)}. Signos: ${getTextSummary(aiOutput.alarmSigns, 30)}`,
          fullInput: inputForAI,
          fullOutput: aiOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error generating patient advice:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setPatientAdviceError(errorMessage);
      setGeneratedPatientAdvice({ generalRecommendations: null, alarmSigns: null });
      toast({ title: "Error al Generar Consejos", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'PatientAdvice',
          inputType: 'application/json',
          inputSummary: `Dx Validados: ${patientAdviceInput.validatedDiagnoses?.length || 0}`,
          outputSummary: 'Error en la generación',
          fullInput: inputForAI,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsGeneratingPatientAdvice(false);
    }
  };

  const handleClearModule = () => {
    clearPatientAdviceModule();
    toast({ title: "Módulo Limpiado", description: "Se han limpiado las recomendaciones y signos de alarma." });
  };
  
  const handleRecommendationsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedPatientAdvice(prev => ({ ...prev, generalRecommendations: event.target.value }));
  };

  const handleAlarmSignsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedPatientAdvice(prev => ({ ...prev, alarmSigns: event.target.value }));
  };

  const handleCopyToClipboard = (text: string | null, type: string) => {
    if (text) {
      navigator.clipboard.writeText(text)
        .then(() => toast({ title: `${type} Copiados`, description: `Los ${type.toLowerCase()} han sido copiados.` }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: `Nada que Copiar`, description: `No hay ${type.toLowerCase()} generados para copiar.` });
    }
  };

  const handleConvertToUppercase = (section: 'recommendations' | 'alarms') => {
    if (section === 'recommendations' && generatedPatientAdvice.generalRecommendations) {
      setGeneratedPatientAdvice(prev => ({
        ...prev,
        generalRecommendations: prev.generalRecommendations!.toUpperCase()
      }));
      toast({ title: "Recomendaciones en Mayúsculas" });
    } else if (section === 'alarms' && generatedPatientAdvice.alarmSigns) {
      setGeneratedPatientAdvice(prev => ({
        ...prev,
        alarmSigns: prev.alarmSigns!.toUpperCase()
      }));
      toast({ title: "Signos de Alarma en Mayúsculas" });
    }
  };
  
  const handleSaveManually = async () => {
    if (!generatedPatientAdvice.generalRecommendations && !generatedPatientAdvice.alarmSigns && !patientAdviceError) {
      toast({ title: "Nada que Guardar", description: "Genere consejos primero.", variant: "default" });
      return;
    }
    
    const status = patientAdviceError ? 'error' : 'completed';
    const output = patientAdviceError ? { error: patientAdviceError } : generatedPatientAdvice;
    const outputSum = patientAdviceError 
        ? 'Error en la generación' 
        : `Recomendaciones: ${getTextSummary(generatedPatientAdvice.generalRecommendations, 30)}. Signos: ${getTextSummary(generatedPatientAdvice.alarmSigns, 30)}`;

    const inputForHistory: GeneratePatientAdviceInput = {
        clinicalAnalysis: patientAdviceInput.clinicalAnalysis || undefined,
        textSummary: patientAdviceInput.textSummary || undefined,
        validatedDiagnoses: patientAdviceInput.validatedDiagnoses || undefined,
      };
    
    await addHistoryEntry({
      module: 'PatientAdvice',
      inputType: 'application/json',
      inputSummary: `Dx Validados: ${patientAdviceInput.validatedDiagnoses?.length || 0}, Análisis: ${!!patientAdviceInput.clinicalAnalysis}, Resumen: ${!!patientAdviceInput.textSummary}`,
      outputSummary: outputSum,
      fullInput: inputForHistory,
      fullOutput: output,
      status: status,
      errorDetails: patientAdviceError || undefined,
    });
  };

  const canGenerate = patientAdviceInput.clinicalAnalysis || patientAdviceInput.textSummary || (patientAdviceInput.validatedDiagnoses && patientAdviceInput.validatedDiagnoses.length > 0);

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Recomendaciones y Signos de Alarma para Paciente"
      description="Genera consejos y signos de alarma basados en el análisis, resumen y diagnósticos validados. Los títulos se incluyen automáticamente."
      icon={UserCheck}
      isLoading={isGeneratingPatientAdvice}
      id="patient-advice-module"
    >
      <div className="space-y-4">
        <div className="space-y-2 p-3 border rounded-md bg-muted/30 text-sm">
            <h4 className="font-semibold">Datos de Entrada para Generación:</h4>
            <p><strong>Análisis Clínico (M4):</strong> {getTextSummary(patientAdviceInput.clinicalAnalysis, 70) || "No disponible"}</p>
            <p><strong>Resumen de Texto (M3):</strong> {getTextSummary(patientAdviceInput.textSummary, 70) || "No disponible"}</p>
            <div>
              <strong>Dx. Validados (M5):</strong>
              {patientAdviceInput.validatedDiagnoses && patientAdviceInput.validatedDiagnoses.length > 0 ? (
                <ul className="list-disc pl-5">
                  {patientAdviceInput.validatedDiagnoses.map(dx => (
                    <li key={dx.code}>{dx.code} - {getTextSummary(dx.description, 50)}</li>
                  ))}
                </ul>
              ) : (
                " Ninguno seleccionado"
              )}
            </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleGenerateAdvice} disabled={!canGenerate || isGeneratingPatientAdvice} className="flex-1">
            <UserCheck className="mr-2 h-4 w-4" />
            Generar Consejos
          </Button>
          <Button onClick={handleClearModule} variant="outline" disabled={isGeneratingPatientAdvice} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>

        {(generatedPatientAdvice.generalRecommendations !== null || generatedPatientAdvice.alarmSigns !== null) && (
          <div className="space-y-4">
            {generatedPatientAdvice.generalRecommendations !== null && (
              <div className="space-y-2">
                <h3 className="text-md font-semibold font-headline">Recomendaciones Generales:</h3>
                <Textarea
                  value={generatedPatientAdvice.generalRecommendations || ''}
                  onChange={handleRecommendationsChange}
                  rows={6}
                  className="bg-muted/30"
                  disabled={isGeneratingPatientAdvice}
                  placeholder="Recomendaciones generadas aparecerán aquí..."
                />
                <div className="flex space-x-2">
                    <Button 
                        onClick={() => handleCopyToClipboard(generatedPatientAdvice.generalRecommendations, "Recomendaciones")} 
                        variant="outline" 
                        size="sm" 
                        disabled={isGeneratingPatientAdvice || !generatedPatientAdvice.generalRecommendations}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                    <Button 
                        onClick={() => handleConvertToUppercase('recommendations')} 
                        variant="outline" 
                        size="sm" 
                        disabled={isGeneratingPatientAdvice || !generatedPatientAdvice.generalRecommendations}
                    >
                      <ALargeSmall className="mr-2 h-4 w-4" />
                      Mayúsculas
                    </Button>
                </div>
              </div>
            )}

            {generatedPatientAdvice.alarmSigns !== null && (
              <div className="space-y-2">
                <h3 className="text-md font-semibold font-headline text-destructive flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5"/>
                    Signos de Alarma:
                </h3>
                <Textarea
                  value={generatedPatientAdvice.alarmSigns || ''}
                  onChange={handleAlarmSignsChange}
                  rows={6}
                  className="bg-muted/30 border-destructive/50 focus-visible:ring-destructive"
                  disabled={isGeneratingPatientAdvice}
                  placeholder="Signos de alarma generados aparecerán aquí..."
                />
                 <div className="flex space-x-2">
                    <Button 
                        onClick={() => handleCopyToClipboard(generatedPatientAdvice.alarmSigns, "Signos de Alarma")} 
                        variant="outline" 
                        size="sm" 
                        disabled={isGeneratingPatientAdvice || !generatedPatientAdvice.alarmSigns}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                     <Button 
                        onClick={() => handleConvertToUppercase('alarms')} 
                        variant="outline" 
                        size="sm" 
                        disabled={isGeneratingPatientAdvice || !generatedPatientAdvice.alarmSigns}
                    >
                      <ALargeSmall className="mr-2 h-4 w-4" />
                      Mayúsculas
                    </Button>
                </div>
              </div>
            )}
          </div>
        )}
        {patientAdviceError && (
          <p className="text-sm text-destructive">Error: {patientAdviceError}</p>
        )}
        
        {!isAutoSaveEnabled && (generatedPatientAdvice.generalRecommendations !== null || generatedPatientAdvice.alarmSigns !== null || patientAdviceError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2" disabled={isGeneratingPatientAdvice}>
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}

