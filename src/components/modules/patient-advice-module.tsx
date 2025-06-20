
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generatePatientAdvice, type GeneratePatientAdviceOutput, type GeneratePatientAdviceInput } from '@/ai/flows/generate-patient-advice';
import type { PatientAdviceInputData, ValidatedDiagnosis, PatientAdviceOutputState } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Eraser, Save, Copy, AlertTriangle, Utensils, ShieldPlus, CopyPlus } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';

interface PatientAdviceModuleProps {
  id?: string;
}

export function PatientAdviceModule({ id }: PatientAdviceModuleProps) {
  const {
    generatedClinicalAnalysis,
    textAnalysisSummary,
    diagnosisResults,
    patientAdviceInput, setPatientAdviceInput,
    generatedPatientAdvice, setGeneratedPatientAdvice,
    isGeneratingPatientAdvice, setIsGeneratingPatientAdvice,
    patientAdviceError, setPatientAdviceError,
    clearPatientAdviceModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const validatedDiagnoses: ValidatedDiagnosis[] = diagnosisResults
      ?.filter(d => d.isValidated)
      .map(d => ({ code: d.code, description: d.description })) || [];

    setPatientAdviceInput(prevInput => ({
        ...prevInput, // Preserve manualDiagnosisOrAnalysis
        clinicalAnalysis: generatedClinicalAnalysis || null,
        textSummary: textAnalysisSummary || null,
        validatedDiagnoses: validatedDiagnoses.length > 0 ? validatedDiagnoses : null,
    }));
  }, [generatedClinicalAnalysis, textAnalysisSummary, diagnosisResults, setPatientAdviceInput]);

  const handleManualInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPatientAdviceInput(prevInput => ({
        ...prevInput,
        manualDiagnosisOrAnalysis: event.target.value,
    }));
  };

  const handleGenerateAdvice = async () => {
    const hasValidatedDx = patientAdviceInput.validatedDiagnoses && patientAdviceInput.validatedDiagnoses.length > 0;
    const hasManualText = String(patientAdviceInput.manualDiagnosisOrAnalysis || '').trim() !== '';

    if (!hasValidatedDx && !hasManualText) {
      toast({ title: "Datos Insuficientes", description: "Se requiere al menos un diagnóstico validado o un texto de diagnóstico/análisis manual.", variant: "destructive" });
      return;
    }

    setIsGeneratingPatientAdvice(true);
    setPatientAdviceError(null);
    let aiOutput: GeneratePatientAdviceOutput | null = null;

    const inputForAI: GeneratePatientAdviceInput = {
      clinicalAnalysis: patientAdviceInput.clinicalAnalysis || undefined, // Pass as undefined if null for Zod optional
      textSummary: patientAdviceInput.textSummary || undefined, // Pass as undefined if null for Zod optional
      validatedDiagnoses: patientAdviceInput.validatedDiagnoses || undefined,
      manualDiagnosisOrAnalysis: String(patientAdviceInput.manualDiagnosisOrAnalysis || '').trim() || undefined,
    };

    try {
      aiOutput = await generatePatientAdvice(inputForAI);
      setGeneratedPatientAdvice({ 
        generalRecommendations: aiOutput.generalRecommendations,
        alarmSigns: aiOutput.alarmSigns,
        dietaryIndications: aiOutput.dietaryIndications,
        generalCare: aiOutput.generalCare,
      });
      toast({ title: "Consejos Generados", description: "Se han generado recomendaciones, signos de alarma, indicaciones de dieta y cuidados generales." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'PatientAdvice',
          inputType: 'application/json',
          inputSummary: `Dx Validados: ${inputForAI.validatedDiagnoses?.length || 0}. Manual: ${inputForAI.manualDiagnosisOrAnalysis ? 'Sí' : 'No'}`,
          outputSummary: `Rec: ${getTextSummary(aiOutput.generalRecommendations, 20)}. Signos: ${getTextSummary(aiOutput.alarmSigns, 20)}. Dieta: ${getTextSummary(aiOutput.dietaryIndications, 20)}. Cuidados: ${getTextSummary(aiOutput.generalCare, 20)}`,
          fullInput: inputForAI,
          fullOutput: aiOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error generating patient advice:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setPatientAdviceError(errorMessage);
      setGeneratedPatientAdvice({ generalRecommendations: null, alarmSigns: null, dietaryIndications: null, generalCare: null });
      toast({ title: "Error al Generar Consejos", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'PatientAdvice',
          inputType: 'application/json',
          inputSummary: `Dx Validados: ${inputForAI.validatedDiagnoses?.length || 0}. Manual: ${inputForAI.manualDiagnosisOrAnalysis ? 'Sí' : 'No'}`,
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
    toast({ title: "Módulo Limpiado", description: "Se han limpiado todos los consejos generados." });
  };
  
  const handleOutputChange = (field: keyof PatientAdviceOutputState, value: string | null) => {
    setGeneratedPatientAdvice(prev => ({ ...prev, [field]: value }));
  };

  const handleCopyToClipboard = (text: string | null, type: string) => {
    if (text && text.trim() !== '') {
      navigator.clipboard.writeText(text)
        .then(() => toast({ title: `${type} Copiados`, description: `Los ${type.toLowerCase()} han sido copiados.` }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    } else {
      toast({ title: `Nada que Copiar`, description: `No hay ${type.toLowerCase()} generados para copiar.` });
    }
  };

  const handleCopyAllAdvice = () => {
    const {
      generalRecommendations,
      dietaryIndications,
      generalCare,
      alarmSigns,
    } = generatedPatientAdvice;

    const parts = [
      generalRecommendations,
      dietaryIndications,
      generalCare,
      alarmSigns,
    ].filter(part => part && part.trim() !== ''); 

    if (parts.length === 0) {
      toast({ title: "Nada que Copiar", description: "No hay consejos generados para copiar.", variant: "default" });
      return;
    }

    const allAdviceText = parts.join('\n\n'); 

    navigator.clipboard.writeText(allAdviceText)
      .then(() => toast({ title: "Todos los Consejos Copiados", description: "Se ha copiado el contenido de todas las secciones." }))
      .catch(() => toast({ title: "Error al Copiar Todo", variant: "destructive" }));
  };
  
  const handleSaveManually = async () => {
    if (!generatedPatientAdvice.generalRecommendations && !generatedPatientAdvice.alarmSigns && !generatedPatientAdvice.dietaryIndications && !generatedPatientAdvice.generalCare && !patientAdviceError) {
      toast({ title: "Nada que Guardar", description: "Genere consejos primero.", variant: "default" });
      return;
    }
    
    const status = patientAdviceError ? 'error' : 'completed';
    const output = patientAdviceError ? { error: patientAdviceError } : generatedPatientAdvice;
    const outputSum = patientAdviceError 
        ? 'Error en la generación' 
        : `Rec: ${getTextSummary(generatedPatientAdvice.generalRecommendations, 20)}. Dieta: ${getTextSummary(generatedPatientAdvice.dietaryIndications, 20)}. Cuid: ${getTextSummary(generatedPatientAdvice.generalCare, 20)}. Alarm: ${getTextSummary(generatedPatientAdvice.alarmSigns, 20)}`;

    const inputForHistory: GeneratePatientAdviceInput = {
        clinicalAnalysis: patientAdviceInput.clinicalAnalysis || undefined,
        textSummary: patientAdviceInput.textSummary || undefined,
        validatedDiagnoses: patientAdviceInput.validatedDiagnoses || undefined,
        manualDiagnosisOrAnalysis: String(patientAdviceInput.manualDiagnosisOrAnalysis || '').trim() || undefined,
      };
    
    await addHistoryEntry({
      module: 'PatientAdvice',
      inputType: 'application/json',
      inputSummary: `Dx Validados: ${inputForHistory.validatedDiagnoses?.length || 0}. Manual: ${inputForHistory.manualDiagnosisOrAnalysis ? 'Sí' : 'No'}`,
      outputSummary: outputSum,
      fullInput: inputForHistory,
      fullOutput: output,
      status: status,
      errorDetails: patientAdviceError || undefined,
    });
  };

  const canGenerate = (patientAdviceInput.validatedDiagnoses && patientAdviceInput.validatedDiagnoses.length > 0) || String(patientAdviceInput.manualDiagnosisOrAnalysis || '').trim() !== '';
  const hasAnyAdvice = generatedPatientAdvice.generalRecommendations || generatedPatientAdvice.dietaryIndications || generatedPatientAdvice.generalCare || generatedPatientAdvice.alarmSigns;

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Recomendaciones y Consejos para Paciente"
      description="Genera recomendaciones, signos de alarma, indicaciones de dieta y cuidados generales basados en diagnósticos validados o un texto manual."
      icon={UserCheck}
      isLoading={isGeneratingPatientAdvice}
    >
      <div className="space-y-4">
        <div className="space-y-3 p-3 border rounded-md bg-muted/30">
            <h4 className="text-sm font-semibold">Datos de Entrada para Generación:</h4>
            <div>
              <Label htmlFor="manualDiagnosisOrAnalysis" className="text-xs font-medium">Diagnóstico/Análisis Manual (Opcional):</Label>
              <Textarea
                id="manualDiagnosisOrAnalysis"
                placeholder="Escriba aquí un diagnóstico o análisis corto si no hay diagnósticos validados..."
                value={patientAdviceInput.manualDiagnosisOrAnalysis || ''}
                onChange={handleManualInputChange}
                rows={3}
                className="text-sm bg-background"
                disabled={isGeneratingPatientAdvice}
              />
            </div>
            <div className="text-xs">
              <p><strong>Dx. Validados (M5):</strong>
                {patientAdviceInput.validatedDiagnoses && patientAdviceInput.validatedDiagnoses.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {patientAdviceInput.validatedDiagnoses.map(dx => (
                      <li key={dx.code}>{dx.code} - {getTextSummary(dx.description, 50)}</li>
                    ))}
                  </ul>
                ) : (
                  " Ninguno seleccionado"
                )}
              </p>
            </div>
             <p className="text-xs text-muted-foreground italic">
                Nota: Los diagnósticos validados (si existen) tendrán prioridad. El texto manual se usará si no hay diagnósticos validados.
            </p>
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

        {(generatedPatientAdvice.generalRecommendations !== null || generatedPatientAdvice.alarmSigns !== null || generatedPatientAdvice.dietaryIndications !== null || generatedPatientAdvice.generalCare !== null) && (
          <div className="space-y-4">
            {generatedPatientAdvice.generalRecommendations !== null && (
              <div className="space-y-2">
                <h3 className="text-md font-semibold font-headline">Recomendaciones Generales:</h3>
                <Textarea
                  value={generatedPatientAdvice.generalRecommendations || ''}
                  onChange={(e) => handleOutputChange('generalRecommendations', e.target.value)}
                  rows={4}
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
                </div>
              </div>
            )}
            
            {generatedPatientAdvice.dietaryIndications !== null && (
              <div className="space-y-2">
                <h3 className="text-md font-semibold font-headline flex items-center">
                  <Utensils className="mr-2 h-5 w-5 text-primary"/>
                  Indicaciones sobre la Dieta:
                </h3>
                <Textarea
                  value={generatedPatientAdvice.dietaryIndications || ''}
                  onChange={(e) => handleOutputChange('dietaryIndications', e.target.value)}
                  rows={4}
                  className="bg-muted/30"
                  disabled={isGeneratingPatientAdvice}
                  placeholder="Indicaciones de dieta generadas aparecerán aquí..."
                />
                <div className="flex space-x-2">
                    <Button 
                        onClick={() => handleCopyToClipboard(generatedPatientAdvice.dietaryIndications, "Indicaciones de Dieta")} 
                        variant="outline" 
                        size="sm" 
                        disabled={isGeneratingPatientAdvice || !generatedPatientAdvice.dietaryIndications}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                </div>
              </div>
            )}

            {generatedPatientAdvice.generalCare !== null && (
              <div className="space-y-2">
                <h3 className="text-md font-semibold font-headline flex items-center">
                  <ShieldPlus className="mr-2 h-5 w-5 text-primary"/>
                  Cuidados Generales:
                </h3>
                <Textarea
                  value={generatedPatientAdvice.generalCare || ''}
                  onChange={(e) => handleOutputChange('generalCare', e.target.value)}
                  rows={4}
                  className="bg-muted/30"
                  disabled={isGeneratingPatientAdvice}
                  placeholder="Cuidados generales generados aparecerán aquí..."
                />
                <div className="flex space-x-2">
                    <Button 
                        onClick={() => handleCopyToClipboard(generatedPatientAdvice.generalCare, "Cuidados Generales")} 
                        variant="outline" 
                        size="sm" 
                        disabled={isGeneratingPatientAdvice || !generatedPatientAdvice.generalCare}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
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
                  onChange={(e) => handleOutputChange('alarmSigns', e.target.value)}
                  rows={4}
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
                </div>
              </div>
            )}
            
            {hasAnyAdvice && (
              <div className="mt-6 pt-4 border-t">
                <Button onClick={handleCopyAllAdvice} variant="secondary" className="w-full" disabled={isGeneratingPatientAdvice}>
                    <CopyPlus className="mr-2 h-4 w-4" />
                    Copiar Todos los Consejos
                </Button>
              </div>
            )}
          </div>
        )}
        {patientAdviceError && (
          <p className="text-sm text-destructive">Error: {patientAdviceError}</p>
        )}
        
        {!isAutoSaveEnabled && (generatedPatientAdvice.generalRecommendations !== null || generatedPatientAdvice.alarmSigns !== null || generatedPatientAdvice.dietaryIndications !== null || generatedPatientAdvice.generalCare !== null || patientAdviceError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2" disabled={isGeneratingPatientAdvice}>
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
