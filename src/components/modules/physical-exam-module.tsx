'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generatePhysicalExam, type GeneratePhysicalExamOutput } from '@/ai/flows/generate-physical-exam';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Eraser, Save, Copy } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface PhysicalExamModuleProps {
  id?: string;
}

export function PhysicalExamModule({ id }: PhysicalExamModuleProps) {
  const {
    textAnalysisSummary,
    physicalExamInput, setPhysicalExamInput,
    generatedPhysicalExam, setGeneratedPhysicalExam,
    isGeneratingPhysicalExam, setIsGeneratingPhysicalExam,
    physicalExamError, setPhysicalExamError,
    clearPhysicalExamModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textAnalysisSummary !== physicalExamInput) {
        setPhysicalExamInput(textAnalysisSummary);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textAnalysisSummary, setPhysicalExamInput]);

  const handleGenerateExam = async () => {
    const currentInput = String(physicalExamInput || '').trim();
    if (!currentInput) {
      toast({ title: "Sin Texto Clínico", description: "Se necesita el texto del módulo de 'Mejora de Redacción' para generar el examen físico.", variant: "destructive" });
      return;
    }

    setIsGeneratingPhysicalExam(true);
    setPhysicalExamError(null);
    let examOutput: GeneratePhysicalExamOutput | null = null;

    try {
      examOutput = await generatePhysicalExam({ clinicalText: currentInput });
      setGeneratedPhysicalExam(examOutput?.physicalExamText || null);
      toast({ title: "Examen Físico Sugerido", description: "Se han generado hallazgos para el examen físico." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'PhysicalExam',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentInput),
          outputSummary: `${getTextSummary(examOutput?.physicalExamText || '', 100)}`,
          fullInput: currentInput,
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
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentInput),
          outputSummary: 'Error en la generación',
          fullInput: currentInput,
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
    const currentInput = String(physicalExamInput || '');
    if (!currentInput && !generatedPhysicalExam && !physicalExamError) {
      toast({ title: "Nada que Guardar", description: "Genere un examen físico primero.", variant: "default" });
      return;
    }
    
    const status = physicalExamError ? 'error' : 'completed';
    const output = physicalExamError ? { error: physicalExamError } : { physicalExamText: generatedPhysicalExam };
    const outputSum = physicalExamError ? 'Error en la generación' : getTextSummary(generatedPhysicalExam, 100);

    await addHistoryEntry({
      module: 'PhysicalExam',
      inputType: 'text/plain',
      inputSummary: getTextSummary(currentInput),
      outputSummary: outputSum,
      fullInput: currentInput,
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
      description="Basado en el texto médico mejorado, la IA sugiere hallazgos patológicos para un examen físico enfocado."
      icon={Stethoscope}
      isLoading={isGeneratingPhysicalExam}
    >
        <div className="space-y-4">
            <div className='p-3 border rounded-md bg-muted/30'>
                <label htmlFor="physicalExamInput" className="block text-sm font-medium mb-1">
                Texto Clínico Base (del Módulo 3):
                </label>
                <p id="physicalExamInput" className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {getTextSummary(physicalExamInput, 200) || "Esperando texto del módulo de 'Mejora de Redacción Médica'..."}
                </p>
            </div>
            
            <Button onClick={handleGenerateExam} disabled={!String(physicalExamInput || '').trim() || isGeneratingPhysicalExam} className="w-full">
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
