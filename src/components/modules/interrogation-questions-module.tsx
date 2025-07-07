
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { suggestInterrogationQuestions, type SuggestInterrogationQuestionsOutput } from '@/ai/flows/suggest-interrogation-questions';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Eraser, Save, Copy } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import type { InterrogationQuestion } from '@/types';

interface InterrogationQuestionsModuleProps {
  id?: string;
}

export function InterrogationQuestionsModule({ id }: InterrogationQuestionsModuleProps) {
  const {
    textAnalysisSummary,
    interrogationQuestionsInput, setInterrogationQuestionsInput,
    generatedInterrogationQuestions, setGeneratedInterrogationQuestions,
    isGeneratingInterrogationQuestions, setIsGeneratingInterrogationQuestions,
    interrogationQuestionsError, setInterrogationQuestionsError,
    clearInterrogationQuestionsModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textAnalysisSummary !== interrogationQuestionsInput) {
        setInterrogationQuestionsInput(textAnalysisSummary);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textAnalysisSummary, setInterrogationQuestionsInput]);

  const handleGenerateQuestions = async () => {
    const currentInput = String(interrogationQuestionsInput || '').trim();
    if (!currentInput) {
      toast({ title: "Sin Texto Clínico", description: "Se necesita el texto del módulo de 'Mejora de Redacción' para generar preguntas.", variant: "destructive" });
      return;
    }

    setIsGeneratingInterrogationQuestions(true);
    setInterrogationQuestionsError(null);
    let questionsOutput: SuggestInterrogationQuestionsOutput | null = null;

    try {
      questionsOutput = await suggestInterrogationQuestions({ clinicalText: currentInput });
      setGeneratedInterrogationQuestions(questionsOutput?.questions || null);
      toast({ title: "Preguntas Sugeridas", description: "Se han generado preguntas para el interrogatorio." });

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'InterrogationQuestions',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentInput),
          outputSummary: `${questionsOutput?.questions?.length || 0} preguntas generadas`,
          fullInput: currentInput,
          fullOutput: questionsOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error generating interrogation questions:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setInterrogationQuestionsError(errorMessage);
      toast({ title: "Error al Sugerir Preguntas", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
         await addHistoryEntry({
          module: 'InterrogationQuestions',
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
      setIsGeneratingInterrogationQuestions(false);
    }
  };

  const handleClearModule = () => {
    clearInterrogationQuestionsModule();
    toast({ title: "Módulo Limpiado", description: "Se han limpiado las preguntas sugeridas." });
  };

  const handleCopyToClipboard = () => {
    const questionsText = generatedInterrogationQuestions?.map(q => `${q.question} (${q.rationale})`).join('\n');
    if (!questionsText) {
      toast({ title: "Sin Preguntas", description: "No hay preguntas para copiar.", variant: "default" });
      return;
    }
    navigator.clipboard.writeText(questionsText)
      .then(() => toast({ title: "Preguntas Copiadas", description: "Las preguntas sugeridas han sido copiadas." }))
      .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
  };

  const handleSaveManually = async () => {
    const currentInput = String(interrogationQuestionsInput || '');
    if (!currentInput && !generatedInterrogationQuestions && !interrogationQuestionsError) {
      toast({ title: "Nada que Guardar", description: "Genere preguntas primero.", variant: "default" });
      return;
    }
    
    const status = interrogationQuestionsError ? 'error' : 'completed';
    const output = interrogationQuestionsError ? { error: interrogationQuestionsError } : { questions: generatedInterrogationQuestions };
    const outputSum = interrogationQuestionsError ? 'Error en la generación' : `${generatedInterrogationQuestions?.length || 0} preguntas generadas`;

    await addHistoryEntry({
      module: 'InterrogationQuestions',
      inputType: 'text/plain',
      inputSummary: getTextSummary(currentInput),
      outputSummary: outputSum,
      fullInput: currentInput,
      fullOutput: output,
      status: status,
      errorDetails: interrogationQuestionsError || undefined,
    });
  };

  const questionsToDisplay = generatedInterrogationQuestions?.map(q => `- ${q.question} (${q.rationale})`).join('\n') || '';

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Ampliación de Interrogatorio Dirigido"
      description="Basado en el texto médico mejorado, la IA sugiere preguntas clave para profundizar en la historia del paciente."
      icon={HelpCircle}
      isLoading={isGeneratingInterrogationQuestions}
    >
        <div className="space-y-4">
            <div className='p-3 border rounded-md bg-muted/30'>
                <label htmlFor="interrogationInput" className="block text-sm font-medium mb-1">
                Texto Clínico Base (del Módulo 3):
                </label>
                <p id="interrogationInput" className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {getTextSummary(interrogationQuestionsInput, 200) || "Esperando texto del módulo de 'Mejora de Redacción Médica'..."}
                </p>
            </div>
            
            <Button onClick={handleGenerateQuestions} disabled={!String(interrogationQuestionsInput || '').trim() || isGeneratingInterrogationQuestions} className="w-full">
                <HelpCircle className="mr-2 h-4 w-4" />
                Sugerir Preguntas
            </Button>

            {generatedInterrogationQuestions && generatedInterrogationQuestions.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-md font-semibold font-headline">Preguntas Sugeridas:</h3>
                    <Textarea
                        readOnly
                        value={questionsToDisplay}
                        className="bg-background min-h-[150px]"
                        rows={Math.min(10, generatedInterrogationQuestions.length)}
                    />
                    <div className="flex space-x-2">
                        <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar
                        </Button>
                        <Button onClick={handleClearModule} variant="outline" size="sm">
                            <Eraser className="mr-2 h-4 w-4" />
                            Limpiar
                        </Button>
                    </div>
                </div>
            )}
            {interrogationQuestionsError && (
                <p className="text-sm text-destructive">Error: {interrogationQuestionsError}</p>
            )}
            
            {!isAutoSaveEnabled && (generatedInterrogationQuestions || interrogationQuestionsError) && (
            <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
                <Save className="mr-2 h-4 w-4" /> Guardar en Historial
            </Button>
            )}
        </div>
    </ModuleCardWrapper>
  );
}
