
'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModuleCardWrapper } from '@/components/common/module-card-wrapper';
import { useClinicalData } from '@/contexts/clinical-data-context';
import { useHistoryStore } from '@/hooks/use-history-store';
import { generateClinicalAnalysis, type GenerateClinicalAnalysisOutput } from '@/ai/flows/generate-clinical-analysis';
import { useToast } from '@/hooks/use-toast';
import { FileText, Brain, Eraser, Send, Save, Copy } from 'lucide-react';
import { getTextSummary } from '@/lib/utils';
import type { ClinicalAnalysisOutputState } from '@/types';

interface ClinicalAnalysisModuleProps {
  id?: string;
}

export function ClinicalAnalysisModule({ id }: ClinicalAnalysisModuleProps) {
  const {
    clinicalAnalysisInput, setClinicalAnalysisInput, 
    textAnalysisSummary, 
    generatedClinicalAnalysis, setGeneratedClinicalAnalysis,
    isGeneratingClinicalAnalysis, setIsGeneratingClinicalAnalysis,
    clinicalAnalysisError, setClinicalAnalysisError,
    setDiagnosisInputData, 
    clearClinicalAnalysisModule,
  } = useClinicalData();

  const { addHistoryEntry, isAutoSaveEnabled } = useHistoryStore();
  const { toast } = useToast();
  const moduleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textAnalysisSummary !== clinicalAnalysisInput) {
        setClinicalAnalysisInput(textAnalysisSummary);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [textAnalysisSummary, setClinicalAnalysisInput]);


  const handleGenerateAnalysis = async () => {
    const currentInput = String(clinicalAnalysisInput || '').trim();
    if (!currentInput) {
      toast({ title: "Sin Resumen Clínico", description: "Por favor, provea un resumen clínico (se obtiene del Módulo 3) para generar el análisis.", variant: "destructive" });
      return;
    }

    setIsGeneratingClinicalAnalysis(true);
    setClinicalAnalysisError(null);
    let analysisOutput: GenerateClinicalAnalysisOutput | null = null;

    try {
      analysisOutput = await generateClinicalAnalysis({ clinicalSummary: currentInput });
      const newComprehensiveAnalysis = (analysisOutput?.comprehensiveAnalysis || '').trim();
      const newFocusedAnalysis = (analysisOutput?.focusedAnalysis || '').trim();
      
      setGeneratedClinicalAnalysis({
        comprehensiveAnalysis: newComprehensiveAnalysis,
        focusedAnalysis: newFocusedAnalysis,
      });

      toast({ title: "Análisis Clínico Generado", description: "El caso ha sido analizado por la IA." });
      
      if (newComprehensiveAnalysis) {
        const analysisBlockToAdd = `[Análisis Clínico del Caso por IA]:\n${newComprehensiveAnalysis}`;
        setDiagnosisInputData(prev => `${prev ? prev + '\n\n' : ''}${analysisBlockToAdd}`);
        toast({
          title: "Análisis Enviado a Diagnóstico",
          description: "El análisis clínico completo se ha añadido automáticamente para soporte diagnóstico.",
        });
        setTimeout(() => {
          const diagnosisModule = document.getElementById('diagnosis-support-module');
          diagnosisModule?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 0);
      }

      if (isAutoSaveEnabled) {
        await addHistoryEntry({
          module: 'ClinicalAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentInput),
          outputSummary: `Completo: ${getTextSummary(newComprehensiveAnalysis, 50)}. Enfocado: ${getTextSummary(newFocusedAnalysis, 50)}`,
          fullInput: currentInput,
          fullOutput: analysisOutput as ClinicalAnalysisOutputState,
          status: 'completed',
        });
      }
    } catch (error: any) {
      console.error("Error generating clinical analysis:", error);
      const errorMessage = error.message || "Ocurrió un error desconocido.";
      setClinicalAnalysisError(errorMessage);
      toast({ title: "Error en Análisis Clínico", description: errorMessage, variant: "destructive" });
      if (isAutoSaveEnabled) {
         await addHistoryEntry({
          module: 'ClinicalAnalysis',
          inputType: 'text/plain',
          inputSummary: getTextSummary(currentInput),
          outputSummary: 'Error en el análisis',
          fullInput: currentInput,
          fullOutput: { error: errorMessage } as any,
          status: 'error',
          errorDetails: errorMessage,
        });
      }
    } finally {
      setIsGeneratingClinicalAnalysis(false);
    }
  };

  const handleClearModule = () => {
    clearClinicalAnalysisModule();
    toast({ title: "Módulo Limpiado", description: "Se ha limpiado el análisis clínico generado." });
  };

  const handleSendToDiagnosis = () => {
    const analysisToSend = String(generatedClinicalAnalysis.comprehensiveAnalysis || '').trim();
    if (!analysisToSend) {
      toast({ title: "Sin Análisis", description: "No hay análisis clínico generado para enviar.", variant: "default" });
      return;
    }
    const analysisBlockToAdd = `[Análisis Clínico del Caso por IA]:\n${analysisToSend}`;
     setDiagnosisInputData(prev => {
        if (prev.includes(analysisBlockToAdd)) return prev;
        return `${prev ? prev + '\n\n' : ''}${analysisBlockToAdd}`;
    });
    toast({ title: "Análisis Enviado a Diagnóstico", description: "El análisis clínico completo se ha añadido para soporte diagnóstico." });
    setTimeout(() => {
        const diagnosisModule = document.getElementById('diagnosis-support-module');
        diagnosisModule?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
  };
  
  const handleCopyToClipboard = (textToCopy: string | null, type: string) => {
    if (!textToCopy || textToCopy.trim() === '') {
      toast({ title: `Sin Análisis ${type}`, description: `No hay análisis ${type.toLowerCase()} para copiar.`, variant: "default" });
      return;
    }
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: `Análisis ${type} Copiado`, description: `El análisis ${type.toLowerCase()} ha sido copiado.` }))
      .catch(() => toast({ title: "Error al Copiar", variant: "destructive" }));
  };

  const handleSaveManually = async () => {
    const currentInput = String(clinicalAnalysisInput || '');
    if (!currentInput && !generatedClinicalAnalysis.comprehensiveAnalysis && !clinicalAnalysisError) {
      toast({ title: "Nada que Guardar", description: "Genere un análisis primero o provea un resumen.", variant: "default" });
      return;
    }
    
    const status = clinicalAnalysisError ? 'error' : 'completed';
    const output = clinicalAnalysisError ? { error: clinicalAnalysisError } as any : generatedClinicalAnalysis;
    const outputSum = clinicalAnalysisError ? 'Error en el análisis' : `Completo: ${getTextSummary(generatedClinicalAnalysis.comprehensiveAnalysis, 50)}. Enfocado: ${getTextSummary(generatedClinicalAnalysis.focusedAnalysis, 50)}`;

    await addHistoryEntry({
      module: 'ClinicalAnalysis',
      inputType: 'text/plain',
      inputSummary: getTextSummary(currentInput),
      outputSummary: outputSum,
      fullInput: currentInput,
      fullOutput: output,
      status: status,
      errorDetails: clinicalAnalysisError || undefined,
    });
  };
  
  const hasOutput = generatedClinicalAnalysis.comprehensiveAnalysis || generatedClinicalAnalysis.focusedAnalysis;

  return (
    <ModuleCardWrapper
      ref={moduleRef}
      id={id}
      title="Análisis Clínico Asistido por IA"
      description="Genera un análisis completo y un resumen enfocado a partir del texto del Módulo de Mejora de Redacción."
      icon={Brain}
      isLoading={isGeneratingClinicalAnalysis}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="clinicalSummaryInput" className="block text-sm font-medium mb-1">
            Resumen de Información Clave (del Módulo 3):
          </label>
          <Textarea
            id="clinicalSummaryInput"
            placeholder="El resumen del Módulo 3 aparecerá aquí automáticamente. Puede editarlo si es necesario antes de generar el análisis."
            value={clinicalAnalysisInput || ''}
            onChange={(e) => setClinicalAnalysisInput(e.target.value)} 
            rows={6}
            disabled={isGeneratingClinicalAnalysis}
            className="bg-muted/30"
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleGenerateAnalysis} disabled={!String(clinicalAnalysisInput || '').trim() || isGeneratingClinicalAnalysis} className="flex-1">
            <Brain className="mr-2 h-4 w-4" />
            Generar Análisis Clínico
          </Button>
          <Button onClick={handleClearModule} variant="outline" disabled={isGeneratingClinicalAnalysis} className="flex-1">
            <Eraser className="mr-2 h-4 w-4" />
            Limpiar Análisis
          </Button>
        </div>

        {hasOutput && (
          <div className="space-y-4">
            {generatedClinicalAnalysis.focusedAnalysis && (
              <div className="space-y-2">
                <h3 className="text-md font-semibold font-headline">Análisis Enfocado (Resumen):</h3>
                <Textarea
                  value={generatedClinicalAnalysis.focusedAnalysis}
                  readOnly 
                  rows={3}
                  className="bg-muted/30"
                />
                <Button onClick={() => handleCopyToClipboard(generatedClinicalAnalysis.focusedAnalysis, 'Enfocado')} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar Análisis Enfocado
                </Button>
              </div>
            )}
            
            {generatedClinicalAnalysis.comprehensiveAnalysis && (
              <div className="space-y-2">
                <h3 className="text-md font-semibold font-headline">Análisis Clínico Completo:</h3>
                <Textarea
                  value={generatedClinicalAnalysis.comprehensiveAnalysis}
                  readOnly 
                  rows={8}
                  className="bg-muted/30"
                />
                <div className="flex space-x-2">
                   <Button onClick={() => handleCopyToClipboard(generatedClinicalAnalysis.comprehensiveAnalysis, 'Completo')} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Análisis Completo
                  </Button>
                  <Button onClick={handleSendToDiagnosis} variant="default" size="sm">
                    <Send className="mr-2 h-4 w-4" />
                    Usar Análisis Completo en Diagnóstico
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {clinicalAnalysisError && (
          <p className="text-sm text-destructive">Error: {clinicalAnalysisError}</p>
        )}
        
        {!isAutoSaveEnabled && (hasOutput || clinicalAnalysisError) && (
           <Button onClick={handleSaveManually} variant="secondary" className="w-full mt-2">
            <Save className="mr-2 h-4 w-4" /> Guardar en Historial
          </Button>
        )}
      </div>
    </ModuleCardWrapper>
  );
}
