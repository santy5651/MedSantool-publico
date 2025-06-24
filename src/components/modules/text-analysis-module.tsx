
'use client';

import React, { useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { improveMedicalWriting, type ImproveMedicalWritingOutput } from '@/ai/flows/summarize-clinical-notes';
import { suggestInterrogationQuestions, type SuggestInterrogationQuestionsOutput } from '@/ai/flows/suggest-interrogation-questions';
import { useToast } from '@/hooks/use-toast';
import { ClipboardEdit, Eraser, Copy, Save, Send, HelpCircle } from 'lucide-react';
import { getTextSummary, cn } from '@/lib/utils';
import type { InterrogationQuestion } from '@/types';


interface TextAnalysisModuleProps {
  id?: string;
}

export function TextAnalysisModule({ id }: TextAnalysisModuleProps) {
  const {
    clinicalNotesInput, setClinicalNotesInput,
    textAnalysisSummary, setTextAnalysisSummary,
    isTextAnalyzing, setIsTextAnalyzing,
    textAnalysisError, setTextAnalysisError,
    diagnosisInputData, 
    setDiagnosisInputData,
    generatedInterrogationQuestions, setGeneratedInterrogationQuestions,
    isGeneratingInterrogationQuestions, setIsGeneratingInterrogationQuestions,
    interrogationQuestionsError, setInterrogationQuestionsError,
    clearTextModule
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  const handleImproveWriting = async () => {
    const currentText = String(clinicalNotesInput || '').trim();
    if (currentText === '') {
      toast({ title: "Sin Texto", description: "Por favor, ingrese texto para mejorar.", variant: "destructive" });
      return;
    }

    setIsTextAnalyzing(true);
    setTextAnalysisError(null);
    let analysisOutput: ImproveMedicalWritingOutput | null = null;

    try {
      analysisOutput = await improveMedicalWriting({ clinicalText: currentText });
      const newContent = (analysisOutput?.improvedText || '').trim();
      setTextAnalysisSummary(newContent || null);
      toast({ title: "Redacción Mejorada", description: "El texto ha sido mejorado por la IA." });

      if (newContent) {
        const summaryBlockToAdd = `[Texto Médico Mejorado]:\n${newContent}`;
        const currentDiagnosisText = String(diagnosisInputData || ''); 

        if (!currentDiagnosisText.includes(summaryBlockToAdd)) {
          const newDiagnosisValue = `${currentDiagnosisText ? currentDiagnosisText + '\n\n' : ''}${summaryBlockToAdd}`;
          setDiagnosisInputData(newDiagnosisValue); 
          toast({
            title: "Texto Enviado a Diagnóstico",
            description: "El texto mejorado se ha añadido para soporte diagnóstico.",
          });
          
          setTimeout(() => {
            const diagnosisModule = document.getElementById('diagnosis-support-module');
            diagnosisModule?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 0);
        }
      }

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'TextAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentText),
          outputSummary: getTextSummary(newContent || '', 100),
          fullInput: currentText,
          fullOutput: { improvedText: newContent },
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error improving text:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setTextAnalysisError(errorMessage);
      toast({ title: "Error en la Mejora", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
         await addHistoryEntry({
          module: 'TextAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentText),
          outputSummary: 'Error en la mejora',
          fullInput: currentText,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsTextAnalyzing(false);
    }
  };
  
  const handleGenerateQuestions = async () => {
    const currentInput = String(textAnalysisSummary || '').trim();
    if (!currentInput) {
      toast({ title: "Sin Texto Base", description: "Primero debe mejorar la redacción de un texto para generar preguntas.", variant: "destructive" });
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

  const handleClearText = () => {
    clearTextModule();
    toast({ title: "Módulo Limpiado", description: "Se ha limpiado el módulo." });
  };

  const handleCopyToClipboard = (type: 'improvedText' | 'questions') => {
    let textToCopy = '';
    let toastTitle = '';

    if (type === 'improvedText') {
        textToCopy = String(textAnalysisSummary || '').trim();
        toastTitle = "Texto Mejorado Copiado";
    } else if (type === 'questions') {
        textToCopy = generatedInterrogationQuestions?.map(q => `- ${q.question} (${q.rationale})`).join('\n') || '';
        toastTitle = "Preguntas Copiadas";
    }

    if (textToCopy === '') {
      toast({ title: "Sin Contenido", description: "No hay nada que copiar.", variant: "default"});
      return;
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: toastTitle, description: "El contenido ha sido copiado al portapapeles." }))
      .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
  };
  
  const handleSendTextToDiagnosis = () => {
    const textToSend = String(textAnalysisSummary || '').trim();
    if (!textToSend) {
      toast({ title: "Sin Texto", description: "No hay texto mejorado para enviar a diagnóstico.", variant: "default" });
      return;
    }

    const textBlockToAdd = `[Texto Médico Mejorado]:\n${textToSend}`;
    const currentDiagnosisText = String(diagnosisInputData || ''); 

    if (currentDiagnosisText.includes(textBlockToAdd)) {
      toast({ title: "Texto ya Incluido", description: "El texto mejorado ya está en los datos de diagnóstico.", variant: "default" });
    } else {
      const newDiagnosisValue = `${currentDiagnosisText ? currentDiagnosisText + '\n\n' : ''}${textBlockToAdd}`;
      setDiagnosisInputData(newDiagnosisValue); 
      toast({ title: "Texto Enviado a Diagnóstico", description: "El texto mejorado ha sido añadido para soporte diagnóstico." });
    }

    setTimeout(() => {
        const diagnosisModule = document.getElementById('diagnosis-support-module');
        diagnosisModule?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
  };


  const handleSaveManually = async (type: 'textAnalysis' | 'interrogationQuestions') => {
    const currentText = String(clinicalNotesInput || '');
    const currentImprovedText = textAnalysisSummary; 
    
    if (type === 'textAnalysis') {
        if (currentText.trim() === '' && (currentImprovedText === null || currentImprovedText === undefined) && !textAnalysisError) {
          toast({ title: "Nada que Guardar", description: "No hay texto de entrada ni texto mejorado para guardar.", variant: "default" });
          return;
        }
        let outputToSave = textAnalysisError ? { error: textAnalysisError } : { improvedText: currentImprovedText || '' };
        let outputSummaryForHistory = textAnalysisError ? 'Error en la mejora' : getTextSummary(currentImprovedText || '', 100);
        let status: 'completed' | 'error' = textAnalysisError ? 'error' : 'completed';
        
        await addHistoryEntry({
          module: 'TextAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentText),
          outputSummary: outputSummaryForHistory,
          fullInput: currentText,
          fullOutput: outputToSave,
          status: status,
          errorDetails: textAnalysisError || undefined,
        });
    } else if (type === 'interrogationQuestions') {
        const questionsInput = String(textAnalysisSummary || '');
        if (!questionsInput && !generatedInterrogationQuestions && !interrogationQuestionsError) {
            toast({ title: "Nada que Guardar", description: "Genere preguntas primero.", variant: "default" });
            return;
        }
        const status = interrogationQuestionsError ? 'error' : 'completed';
        const output = interrogationQuestionsError ? { error: interrogationQuestionsError } : { questions: generatedInterrogationQuestions };
        const outputSum = interrogationQuestionsError ? 'Error en la generación' : `${generatedInterrogationQuestions?.length || 0} preguntas generadas`;
        await addHistoryEntry({
            module: 'InterrogationQuestions',
            inputType: 'text/plain',
            inputSummary: getTextSummary(questionsInput),
            outputSummary: outputSum,
            fullInput: questionsInput,
            fullOutput: output,
            status: status,
            errorDetails: interrogationQuestionsError || undefined,
        });
    }
  };
  
  const questionsToDisplay = generatedInterrogationQuestions?.map(q => `- ${q.question} (${q.rationale})`).join('\n') || '';

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Mejora de Redacción Médica"
      description="Introduce un texto para que la IA lo amplíe y refine, aplicando un estilo de redacción médica profesional."
      icon={ClipboardEdit}
      isLoading={isTextAnalyzing || isGeneratingInterrogationQuestions}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="clinicalNotes" className="block text-sm font-medium mb-1">
            Texto a Mejorar:
          </label>
          <Textarea
            id="clinicalNotes"
            placeholder="Pegue o escriba aquí el texto a mejorar..."
            value={clinicalNotesInput || ''}
            onChange={(e) => setClinicalNotesInput(e.target.value)}
            rows={8}
            disabled={isTextAnalyzing || isGeneratingInterrogationQuestions}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleImproveWriting} disabled={!String(clinicalNotesInput || '').trim() || isTextAnalyzing || isGeneratingInterrogationQuestions} className="flex-1">
            <ClipboardEdit className="mr-2 h-4 w-4" />
            Mejorar Redacción
          </Button>
          <Button onClick={handleClearText} variant="outline" disabled={isTextAnalyzing || isGeneratingInterrogationQuestions} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Texto
          </Button>
        </div>

        {(textAnalysisSummary !== null) && ( 
          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-md font-semibold font-headline">Texto Médico Mejorado:</h3>
            <Textarea
              value={textAnalysisSummary || ''}
              readOnly
              rows={8}
              className="bg-muted/30"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => handleCopyToClipboard('improvedText')} variant="outline" size="sm" disabled={(textAnalysisSummary === null || textAnalysisSummary.trim() === '')}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Texto
              </Button>
              <Button 
                onClick={handleSendTextToDiagnosis} 
                variant="default" 
                size="sm" 
                disabled={(textAnalysisSummary === null || textAnalysisSummary.trim() === '')}
              >
                <Send className="mr-2 h-4 w-4" />
                Usar en Diagnóstico
              </Button>
              <div className="flex-grow" />
              {!isAutoSaveEnabled &&
                <Button onClick={() => handleSaveManually('textAnalysis')} variant="secondary" size="sm">
                  <Save className="mr-2 h-4 w-4" /> Guardar Mejora
                </Button>
              }
            </div>

            <Accordion type="single" collapsible className="w-full pt-2">
              <AccordionItem value="interrogation-questions" className="border-b-0">
                <AccordionTrigger
                  onClick={(e) => {
                    // Generate questions only if accordion is being opened and no questions are loaded yet
                    if (!generatedInterrogationQuestions && !isGeneratingInterrogationQuestions && !interrogationQuestionsError) {
                      handleGenerateQuestions();
                    }
                  }}
                  className="p-0 hover:no-underline"
                >
                  <div className="flex w-full justify-end">
                    <div className={cn(buttonVariants({ variant: 'ghost' }), "inline-flex items-center")}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Sugerir Preguntas de Interrogatorio
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {isGeneratingInterrogationQuestions && <p className="text-sm text-muted-foreground">Generando preguntas...</p>}
                    {interrogationQuestionsError && <p className="text-sm text-destructive">Error: {interrogationQuestionsError}</p>}
                    {generatedInterrogationQuestions && (
                      <>
                        <h4 className="text-sm font-semibold">Preguntas Sugeridas:</h4>
                        <Textarea
                            readOnly
                            value={questionsToDisplay}
                            className="bg-background min-h-[120px]"
                            rows={Math.min(10, generatedInterrogationQuestions.length)}
                        />
                        <div className="flex space-x-2">
                            <Button onClick={() => handleCopyToClipboard('questions')} variant="outline" size="sm">
                                <Copy className="mr-2 h-4 w-4" />
                                Copiar Preguntas
                            </Button>
                            {!isAutoSaveEnabled &&
                              <Button onClick={() => handleSaveManually('interrogationQuestions')} variant="secondary" size="sm">
                                <Save className="mr-2 h-4 w-4" /> Guardar Preguntas
                              </Button>
                            }
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {textAnalysisError && (
          <p className="text-sm text-destructive">Error: {textAnalysisError}</p>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
