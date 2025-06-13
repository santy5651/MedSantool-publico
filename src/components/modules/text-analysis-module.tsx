
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { summarizeClinicalNotes, type SummarizeClinicalNotesOutput } from '@/ai/flows/summarize-clinical-notes';
import { useToast } from '@/hooks/use-toast';
import { ClipboardEdit, Eraser, Copy, Save, MessageSquareText, Send } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';

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
    clearTextModule
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  const handleAnalyzeNotes = async () => {
    const currentNotes = String(clinicalNotesInput || '').trim();
    if (currentNotes === '') {
      toast({ title: "Sin Notas", description: "Por favor, ingrese notas clínicas para analizar.", variant: "destructive" });
      return;
    }

    setIsTextAnalyzing(true);
    setTextAnalysisError(null);
    let analysisOutput: SummarizeClinicalNotesOutput | null = null;

    try {
      analysisOutput = await summarizeClinicalNotes({ clinicalNotes: currentNotes });
      const newSummaryContent = (analysisOutput?.summary || '').trim();
      setTextAnalysisSummary(newSummaryContent || null);
      toast({ title: "Análisis de Texto Completado", description: "Las notas han sido resumidas." });

      if (newSummaryContent) {
        const summaryBlockToAdd = `[Resumen de Notas Clínicas]:\n${newSummaryContent}`;
        const currentDiagnosisText = String(diagnosisInputData || ''); 

        if (!currentDiagnosisText.includes(summaryBlockToAdd)) {
          const newDiagnosisValue = `${currentDiagnosisText ? currentDiagnosisText + '\n\n' : ''}${summaryBlockToAdd}`;
          setDiagnosisInputData(newDiagnosisValue); 
          toast({
            title: "Resumen Enviado a Diagnóstico",
            description: "El resumen de notas se ha añadido automáticamente para soporte diagnóstico.",
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
          inputSummary: getTextSummary(currentNotes),
          outputSummary: getTextSummary(newSummaryContent || '', 100),
          fullInput: currentNotes,
          fullOutput: analysisOutput,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error analyzing text:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setTextAnalysisError(errorMessage);
      toast({ title: "Error de Análisis de Texto", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
         await addHistoryEntry({
          module: 'TextAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentNotes),
          outputSummary: 'Error en el análisis',
          fullInput: currentNotes,
          fullOutput: { error: errorMessage },
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsTextAnalyzing(false);
    }
  };

  const handleClearNotes = () => {
    clearTextModule();
    toast({ title: "Notas Limpiadas", description: "Se ha limpiado el campo de notas clínicas." });
  };

  const handleCopyToClipboard = () => {
    const summaryToCopy = String(textAnalysisSummary || '').trim();

    if (summaryToCopy === '') {
      toast({ title: "Sin Resumen", description: "No hay contenido en el cuadro 'Resumen de Información Clave' para copiar.", variant: "default"});
      return;
    }
    
    navigator.clipboard.writeText(summaryToCopy)
      .then(() => toast({ title: "Resumen Copiado", description: "El contenido del cuadro 'Resumen de Información Clave' ha sido copiado al portapapeles." }))
      .catch(() => toast({ title: "Error al Copiar", description: "No se pudo copiar el contenido del cuadro 'Resumen de Información Clave'.", variant: "destructive" }));
  };
  
  const handleSendSummaryToDiagnosis = () => {
    const summaryToSend = String(textAnalysisSummary || '').trim();
    if (!summaryToSend) {
      toast({ title: "Sin Resumen", description: "No hay contenido en el cuadro 'Resumen de Información Clave' para enviar a diagnóstico.", variant: "default" });
      return;
    }

    const summaryBlockToAdd = `[Resumen de Notas Clínicas]:\n${summaryToSend}`;
    const currentDiagnosisText = String(diagnosisInputData || ''); 

    if (currentDiagnosisText.includes(summaryBlockToAdd)) {
      toast({ title: "Resumen ya Incluido", description: "El contenido del cuadro 'Resumen de Información Clave' ya está en los datos de diagnóstico.", variant: "default" });
    } else {
      const newDiagnosisValue = `${currentDiagnosisText ? currentDiagnosisText + '\n\n' : ''}${summaryBlockToAdd}`;
      setDiagnosisInputData(newDiagnosisValue); 
      toast({ title: "Resumen Enviado a Diagnóstico", description: "El contenido del cuadro 'Resumen de Información Clave' ha sido añadido para soporte diagnóstico." });
    }

    setTimeout(() => {
        const diagnosisModule = document.getElementById('diagnosis-support-module');
        diagnosisModule?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
  };


  const handleSaveManually = async () => {
    const currentNotes = String(clinicalNotesInput || '');
    const currentSummaryInBox = textAnalysisSummary; 
    
    if (currentNotes.trim() === '' && (currentSummaryInBox === null || currentSummaryInBox === undefined) && !textAnalysisError) {
      toast({ title: "Nada que Guardar", description: "No hay notas de entrada ni resumen generado para guardar.", variant: "default" });
      return;
    }
        
    let outputToSave = textAnalysisError ? { error: textAnalysisError } : { summary: currentSummaryInBox || '' };
    let outputSummaryForHistory = textAnalysisError ? 'Error en el análisis' : getTextSummary(currentSummaryInBox || '', 100);
    let status: 'completed' | 'error' = textAnalysisError ? 'error' : 'completed';
    
    await addHistoryEntry({
      module: 'TextAnalysis',
      inputType: 'text/plain',
      inputSummary: getTextSummary(currentNotes),
      outputSummary: outputSummaryForHistory,
      fullInput: currentNotes,
      fullOutput: outputToSave,
      status: status,
      errorDetails: textAnalysisError || undefined,
    });
  };


  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Comprensión Profunda de Texto Clínico"
      description="Ingrese notas clínicas o use datos de módulos anteriores. La IA generará un resumen clave."
      icon={MessageSquareText}
      isLoading={isTextAnalyzing}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="clinicalNotes" className="block text-sm font-medium mb-1">
            Notas Clínicas e Historial (Fuentes: Manual, Resumen de Imagen, Notas de PDF):
          </label>
          <Textarea
            id="clinicalNotes"
            placeholder="Pegue o escriba notas clínicas aquí..."
            value={clinicalNotesInput || ''}
            onChange={(e) => setClinicalNotesInput(e.target.value)}
            rows={8}
            disabled={isTextAnalyzing}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleAnalyzeNotes} disabled={!String(clinicalNotesInput || '').trim() || isTextAnalyzing} className="flex-1">
            <ClipboardEdit className="mr-2 h-4 w-4" />
            Analizar Notas
          </Button>
          <Button onClick={handleClearNotes} variant="outline" disabled={isTextAnalyzing} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Notas
          </Button>
        </div>

        {(textAnalysisSummary !== null) && ( 
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Resumen de Información Clave:</h3>
            <Textarea
              value={textAnalysisSummary || ''}
              readOnly
              rows={6}
              className="bg-muted/30"
            />
            <div className="flex space-x-2">
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={(textAnalysisSummary === null || textAnalysisSummary.trim() === '')}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Resumen
              </Button>
              <Button 
                onClick={handleSendSummaryToDiagnosis} 
                variant="default" 
                size="sm" 
                disabled={(textAnalysisSummary === null || textAnalysisSummary.trim() === '')}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Resumen a Diagnóstico
              </Button>
            </div>
          </div>
        )}
        {textAnalysisError && (
          <p className="text-sm text-destructive">Error: {textAnalysisError}</p>
        )}
         {!isAutoSaveEnabled && 
          (String(clinicalNotesInput || '').trim() !== '' || textAnalysisSummary !== null || textAnalysisError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
