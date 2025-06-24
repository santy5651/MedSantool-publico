'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { improveMedicalWriting, type ImproveMedicalWritingOutput } from '@/ai/flows/summarize-clinical-notes';
import { useToast } from '@/hooks/use-toast';
import { ClipboardEdit, Eraser, Copy, Save, Send } from 'lucide-react';
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

  const handleClearText = () => {
    clearTextModule();
    toast({ title: "Texto Limpiado", description: "Se ha limpiado el módulo." });
  };

  const handleCopyToClipboard = () => {
    const textToCopy = String(textAnalysisSummary || '').trim();

    if (textToCopy === '') {
      toast({ title: "Sin Texto", description: "No hay texto mejorado para copiar.", variant: "default"});
      return;
    }
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Texto Copiado", description: "El texto mejorado ha sido copiado al portapapeles." }))
      .catch(() => toast({ title: "Error al Copiar", description: "No se pudo copiar el texto mejorado.", variant: "destructive" }));
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


  const handleSaveManually = async () => {
    const currentText = String(clinicalNotesInput || '');
    const currentImprovedText = textAnalysisSummary; 
    
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
  };


  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Mejora de Redacción Médica"
      description="Introduce un texto para que la IA lo amplíe y refine, aplicando un estilo de redacción médica profesional."
      icon={ClipboardEdit}
      isLoading={isTextAnalyzing}
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
            disabled={isTextAnalyzing}
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleImproveWriting} disabled={!String(clinicalNotesInput || '').trim() || isTextAnalyzing} className="flex-1">
            <ClipboardEdit className="mr-2 h-4 w-4" />
            Mejorar Redacción
          </Button>
          <Button onClick={handleClearText} variant="outline" disabled={isTextAnalyzing} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Texto
          </Button>
        </div>

        {(textAnalysisSummary !== null) && ( 
          <div className="space-y-2">
            <h3 className="text-md font-semibold font-headline">Texto Médico Mejorado:</h3>
            <Textarea
              value={textAnalysisSummary || ''}
              readOnly
              rows={8}
              className="bg-muted/30"
            />
            <div className="flex space-x-2">
              <Button onClick={handleCopyToClipboard} variant="outline" size="sm" disabled={(textAnalysisSummary === null || textAnalysisSummary.trim() === '')}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Texto Mejorado
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
