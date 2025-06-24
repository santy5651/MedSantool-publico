'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generatePhysicalExam, type GeneratePhysicalExamOutput } from '@/ai/flows/generate-physical-exam';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Eraser, Save, Copy } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import type { ValidatedDiagnosis } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PhysicalExamModuleProps {
  id?: string;
}

export function PhysicalExamModule({ id }: PhysicalExamModuleProps) {
  const {
    diagnosisResults,
    physicalExamInput, setPhysicalExamInput,
    generatedPhysicalExam, setGeneratedPhysicalExam,
    isGeneratingPhysicalExam, setIsGeneratingPhysicalExam,
    physicalExamError, setPhysicalExamError,
    clearPhysicalExamModule,
    generatedClinicalAnalysis,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);
  const [useFocusedAnalysis, setUseFocusedAnalysis] = useState(true);

  useEffect(() => {
    const validatedDiagnoses = diagnosisResults?.filter(d => d.isValidated).map(d => ({ code: d.code, description: d.description })) || [];
    // Prevent infinite loops by comparing stringified versions
    if (JSON.stringify(validatedDiagnoses) !== JSON.stringify(physicalExamInput)) {
        setPhysicalExamInput(validatedDiagnoses);
    }
  }, [diagnosisResults, physicalExamInput, setPhysicalExamInput]);

  const handleGenerateExam = async () => {
    if (!physicalExamInput || physicalExamInput.length === 0) {
      toast({ title: "Sin Diagnósticos", description: "Se necesita al menos un diagnóstico validado del módulo de 'Diagnóstico Inteligente'.", variant: "destructive" });
      return;
    }

    setIsGeneratingPhysicalExam(true);
    setPhysicalExamError(null);
    let examOutput: GeneratePhysicalExamOutput | null = null;
    const focusedAnalysis = useFocusedAnalysis ? generatedClinicalAnalysis.focusedAnalysis : null;

    const inputForAI = {
      diagnoses: physicalExamInput,
      focusedAnalysis: focusedAnalysis || undefined,
    };

    try {
      examOutput = await generatePhysicalExam(inputForAI);
      setGeneratedPhysicalExam(examOutput?.physicalExamText || null);
      toast({ title: "Examen Físico Sugerido", description: "Se han generado hallazgos para el examen físico." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'PhysicalExam',
          inputType: 'application/json',
          inputSummary: `Basado en ${physicalExamInput.length} diagnósticos validados`,
          outputSummary: `${getTextSummary(examOutput?.physicalExamText || '', 100)}`,
          fullInput: inputForAI,
          fullOutput: examOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error generating physical exam:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setPhysicalExamError(errorMessage);
      toast({ title: "Error al Sugerir Examen Físico", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
         await addHistoryEntry({
          module: 'PhysicalExam',
          inputType: 'application/json',
          inputSummary: `Basado en ${physicalExamInput.length} diagnósticos validados`,
          outputSummary: 'Error en la generación',
          fullInput: inputForAI,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsGeneratingPhysicalExam(false);
    }
  };

  const handleClearModule = () => {
    clearPhysicalExamModule();
    toast({ title: "Módulo Limpiado", description: "Se ha limpiado el examen físico sugerido." });
  };

  const handleCopyToClipboard = () => {
    const examText = generatedPhysicalExam;
    if (!examText) {
      toast({ title: "Sin Texto", description: "No hay examen físico para copiar.", variant: "default" });
      return;
    }
    navigator.clipboard.writeText(examText)
      .then(() => toast({ title: "Examen Físico Copiado", description: "Los hallazgos sugeridos han sido copiados." }))
      .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
  };

  const handleSaveManually = async () => {
    if (!physicalExamInput && !generatedPhysicalExam && !physicalExamError) {
      toast({ title: "Nada que Guardar", description: "Genere un examen físico primero.", variant: "default" });
      return;
    }
    
    const status = physicalExamError ? 'error' : 'completed';
    const output = physicalExamError ? { error: physicalExamError } : { physicalExamText: generatedPhysicalExam };
    const outputSum = physicalExamError ? 'Error en la generación' : getTextSummary(generatedPhysicalExam, 100);
    const focusedAnalysis = useFocusedAnalysis ? generatedClinicalAnalysis.focusedAnalysis : null;

    const inputForHistory = {
      diagnoses: physicalExamInput,
      focusedAnalysis: focusedAnalysis || undefined,
    };


    await addHistoryEntry({
      module: 'PhysicalExam',
      inputType: 'application/json',
      inputSummary: `Basado en ${physicalExamInput?.length || 0} diagnósticos validados`,
      outputSummary: outputSum,
      fullInput: inputForHistory,
      fullOutput: output,
      status: status,
      errorDetails: physicalExamError || undefined,
    });
  };

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Generador de Examen Físico Dirigido"
      description="Basado en los diagnósticos validados, la IA sugiere hallazgos patológicos para un examen físico enfocado."
      icon={Stethoscope}
      isLoading={isGeneratingPhysicalExam}
    >
        <div className="space-y-4">
            <div className='p-3 border rounded-md bg-muted/30'>
                <label className="block text-sm font-medium mb-1">
                  Diagnósticos Validados (del Módulo 5):
                </label>
                <div className="text-sm text-muted-foreground">
                  {physicalExamInput && physicalExamInput.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {physicalExamInput.map(dx => (
                        <li key={dx.code}>
                          {dx.code}: {getTextSummary(dx.description, 50)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Esperando diagnósticos validados del módulo de 'Diagnóstico Inteligente'...</p>
                  )}
                </div>
            </div>
            
            {generatedClinicalAnalysis.focusedAnalysis && (
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <Switch
                  id="use-focused-analysis-switch"
                  checked={useFocusedAnalysis}
                  onCheckedChange={setUseFocusedAnalysis}
                />
                <Label htmlFor="use-focused-analysis-switch" className="text-sm font-normal cursor-pointer flex-1">
                  Usar análisis corto del Módulo 4 para enriquecer el examen físico.
                </Label>
              </div>
            )}

            <Button onClick={handleGenerateExam} disabled={!physicalExamInput || physicalExamInput.length === 0 || isGeneratingPhysicalExam} className="w-full">
                <Stethoscope className="mr-2 h-4 w-4" />
                Sugerir Hallazgos de Examen Físico
            </Button>

            {generatedPhysicalExam && (
                <div className="space-y-2">
                    <h3 className="text-md font-semibold font-headline">Hallazgos Sugeridos:</h3>
                    <Textarea
                        readOnly
                        value={generatedPhysicalExam}
                        className="bg-background min-h-[150px]"
                        rows={6}
                    />
                    <div className="flex space-x-2">
                        <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar Hallazgos
                        </Button>
                        <Button onClick={handleClearModule} variant="outline" size="sm">
                            <Eraser className="mr-2 h-4 w-4" />
                            Limpiar
                        </Button>
                    </div>
                </div>
            )}
            {physicalExamError && (
                <p className="text-sm text-destructive">Error: {physicalExamError}</p>
            )}
            
            {!isAutoSaveEnabled && (generatedPhysicalExam || physicalExamError) && (
            <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
                <Save className="mr-2 h-4 w-4" /> Guardar en Historial
            </Button>
            )}
        </div>
    </ModuleCardWrapper>
  );
}
