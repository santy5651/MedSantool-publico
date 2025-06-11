
'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { summarizeClinicalNotes, type SummarizeClinicalNotesOutput } from '@/ai/flows/summarize-clinical-notes';
import { useToast } from '@/hooks/use-toast';
import { ClipboardEdit, Eraser, Copy, Send, Save, MessageSquareText } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';

export function TextAnalysisModule() {
  const {
    clinicalNotesInput, setClinicalNotesInput,
    textAnalysisSummary, setTextAnalysisSummary,
    isTextAnalyzing, setIsTextAnalyzing,
    textAnalysisError, setTextAnalysisError,
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

      // Automatic transfer of summary to Diagnosis Module
      if (newSummaryContent) {
        const summaryBlockToAdd = `[Resumen de Notas Clínicas]:\n${newSummaryContent}`;

        setDiagnosisInputData(prevDiagnosisInput => {
          const currentDiagnosisText = String(prevDiagnosisInput || '');
          if (currentDiagnosisText.includes(summaryBlockToAdd)) {
            return currentDiagnosisText;
          }

          const newText = `${currentDiagnosisText ? currentDiagnosisText + '\n\n' : ''}${summaryBlockToAdd}`;
          toast({
            title: "Resumen Enviado a Diagnóstico",
            description: "El resumen de notas se ha añadido automáticamente para soporte diagnóstico.",
          });

          setTimeout(() => {
            const diagnosisModule = document.getElementById('diagnosis-support-module');
            if (diagnosisModule) {
              diagnosisModule.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 0);

          return newText;
        });
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
    const currentSummary = String(textAnalysisSummary || '').trim();
    if (currentSummary) {
      navigator.clipboard.writeText(currentSummary)
        .then(() => toast({ title: "Resumen Copiado", description: "El resumen ha sido copiado al portapapeles." }))
        .catch(() => toast({ title: "Error al Copiar", description: "No se pudo copiar el resumen.", variant: "destructive" }));
    } else {
      toast({ title: "Sin Resumen", description: "No hay resumen para copiar.", variant: "default"});
    }
  };

  const handleSendToDiagnosis = () => {
    const currentSummary = String(textAnalysisSummary || '').trim();
    if (!currentSummary) {
      toast({ title: "Sin Resumen", description: "Primero analice las notas para obtener un resumen que usar.", variant: "default"});
      return;
    }

    // 1. Copiar al portapapeles
    navigator.clipboard.writeText(currentSummary)
      .then(() => {
        toast({ 
          title: "Resumen Copiado", 
          description: "El resumen se ha copiado al portapapeles." 
        });
      })
      .catch(() => {
        toast({ 
          title: "Error al Copiar", 
          description: "No se pudo copiar el resumen al portapapeles.", 
          variant: "destructive" 
        });
      });

    // 2. Trasladar a Diagnóstico
    const summaryBlockToAdd = `[Resumen de Notas Clínicas]:\n${currentSummary}`;

    setDiagnosisInputData(prev => {
      const currentInput = String(prev || '');

      if (currentInput.includes(summaryBlockToAdd)) {
        toast({
          title: "Resumen ya Incluido en Diagnóstico",
          description: "El resumen formateado ya se encuentra en el campo de diagnóstico.",
          variant: "default", // Usar un tono menos intrusivo si solo se informa que ya existe
        });
        return currentInput;
      } else {
        const newText = `${currentInput ? currentInput + '\n\n' : ''}${summaryBlockToAdd}`;
        // No mostrar un toast aquí si ya se mostró el de "Resumen Copiado"
        // O considerar un toast combinado si la copia fue exitosa.
        // Por ahora, el toast de "Resumen Añadido" se mostrará solo si no estaba ya.
        // Si queremos un solo toast:
        // if (copiadoExitoso) { toast({ title: "Resumen Copiado y Añadido", ... }) }
        // else { toast({ title: "Resumen Añadido", ...})}
        // Simplificando, mantenemos el toast de "añadido" si es una nueva adición.
        toast({
          title: "Resumen Añadido a Diagnóstico",
          description: "El resumen también se ha añadido para soporte diagnóstico.",
        });
        
        setTimeout(() => {
            const diagnosisModule = document.getElementById('diagnosis-support-module');
            if (diagnosisModule) {
                diagnosisModule.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 0);
        return newText;
      }
    });
  };

  const handleSaveManually = async () => {
    const currentNotes = String(clinicalNotesInput || '');
    if (currentNotes.trim() === '' && (!textAnalysisSummary && !textAnalysisError)) {
      toast({ title: "Nada que Guardar", description: "Analice algunas notas primero o ingrese notas.", variant: "default" });
      return;
    }
    
    let inputToSave = currentNotes;
    let outputToSave = textAnalysisError ? { error: textAnalysisError } : { summary: textAnalysisSummary || '' };
    let outputSummaryForHistory = textAnalysisError ? 'Error en el análisis' : getTextSummary(textAnalysisSummary || '', 100);
    let status: 'completed' | 'error' = textAnalysisError ? 'error' : 'completed';

    if (!inputToSave && !textAnalysisSummary && !textAnalysisError) {
        toast({ title: "Nada que Guardar", description: "No hay notas ni resumen para guardar.", variant: "default" });
        return;
    }
    
    await addHistoryEntry({
      module: 'TextAnalysis',
      inputType: 'text/plain',
      inputSummary: getTextSummary(inputToSave),
      outputSummary: outputSummaryForHistory,
      fullInput: inputToSave,
      fullOutput: outputToSave,
      status: status,
      errorDetails: textAnalysisError || undefined,
    });
  };


  return (
    <ModuleCardWrapper
      ref={moduleRef}
      title="Comprensión Profunda de Texto Clínico"
      description="Ingrese notas clínicas o use datos de módulos anteriores. La IA generará un resumen clave."
      icon={MessageSquareText}
      isLoading={isTextAnalyzing}
      id="text-analysis-module"
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

        {(textAnalysisSummary || textAnalysisSummary === '') && ( 
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Resumen de Información Clave:</h3>
            <Textarea
              value={textAnalysisSummary || ''}
              readOnly
              rows={6}
              className="bg-muted/30"
            />
            <div className="flex space-x-2">
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={!textAnalysisSummary && textAnalysisSummary !== ''}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Resumen
              </Button>
              <Button onClick={handleSendToDiagnosis} variant="default" size="sm" disabled={!textAnalysisSummary && textAnalysisSummary !== ''}>
                <Send className="mr-2 h-4 w-4" />
                Usar Resumen para Diagnóstico
              </Button>
            </div>
          </div>
        )}
        {textAnalysisError && (
          <p className="text-sm text-destructive">Error: {textAnalysisError}</p>
        )}
         {!isAutoSaveEnabled && (String(clinicalNotesInput || '').trim() || textAnalysisSummary || textAnalysisSummary === '' || textAnalysisError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
