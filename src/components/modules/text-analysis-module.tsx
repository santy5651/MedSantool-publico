
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
    setDiagnosisInputData, // For "Usar Resumen para Diagnóstico"
    clearTextModule
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  const handleAnalyzeNotes = async () => {
    const notes = String(clinicalNotesInput || '');
    if (notes.trim() === '') {
      toast({ title: "Sin Notas", description: "Por favor, ingrese notas clínicas para analizar.", variant: "destructive" });
      return;
    }

    setIsTextAnalyzing(true);
    setTextAnalysisError(null);
    let analysisOutput: SummarizeClinicalNotesOutput | null = null;

    try {
      analysisOutput = await summarizeClinicalNotes({ clinicalNotes: notes });
      setTextAnalysisSummary(analysisOutput.summary);
      toast({ title: "Análisis de Texto Completado", description: "Las notas han sido resumidas." });
      
      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'TextAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(notes),
          outputSummary: getTextSummary(analysisOutput.summary, 100),
          fullInput: notes,
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
          inputSummary: getTextSummary(notes),
          outputSummary: 'Error en el análisis',
          fullInput: notes,
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
    if (textAnalysisSummary) {
      navigator.clipboard.writeText(textAnalysisSummary)
        .then(() => toast({ title: "Resumen Copiado", description: "El resumen ha sido copiado al portapapeles." }))
        .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
    }
  };

  const handleSendToDiagnosis = () => {
    if (textAnalysisSummary) {
      setDiagnosisInputData(prev => 
        `${prev ? prev + '\n\n' : ''}[Resumen de Notas Clínicas]:\n${textAnalysisSummary}`
      );
      toast({ title: "Resumen Enviado a Diagnóstico", description: "El resumen se ha enviado para soporte diagnóstico." });
      const diagnosisModule = document.getElementById('diagnosis-support-module');
      diagnosisModule?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSaveManually = async () => {
    const notes = String(clinicalNotesInput || '');
    if (notes.trim() === '' || (!textAnalysisSummary && !textAnalysisError)) {
      toast({ title: "Nada que Guardar", description: "Analice algunas notas primero.", variant: "default" });
      return;
    }
    
    const status = textAnalysisError ? 'error' : 'completed';
    const output = textAnalysisError ? { error: textAnalysisError } : { summary: textAnalysisSummary };
    const outputSum = textAnalysisError ? 'Error en el análisis' : getTextSummary(textAnalysisSummary, 100);

    await addHistoryEntry({
      module: 'TextAnalysis',
      inputType: 'text/plain',
      inputSummary: getTextSummary(notes),
      outputSummary: outputSum,
      fullInput: notes,
      fullOutput: output,
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

        {textAnalysisSummary && (
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Resumen de Información Clave:</h3>
            <Textarea
              value={textAnalysisSummary || ''}
              readOnly
              rows={6}
              className="bg-muted/30"
            />
            <div className="flex space-x-2">
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copiar Resumen
              </Button>
              <Button onClick={handleSendToDiagnosis} variant="default" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Usar Resumen para Diagnóstico
              </Button>
            </div>
          </div>
        )}
        {textAnalysisError && (
          <p className="text-sm text-destructive">Error: {textAnalysisError}</p>
        )}
         {!isAutoSaveEnabled && (textAnalysisSummary || textAnalysisError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
